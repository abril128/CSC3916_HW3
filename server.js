/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */
const mongoose = require('mongoose');
const express = require('express');
//var http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');
const authController = require('./auth');
const authJwtController = require('./auth_jwt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies')
const Reviews = require('./Review');
//const crypto = require("crypto"); // tracker
//const rp = require('request-promise');//tracker
//
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//
app.use(passport.initialize());
//
const router = express.Router();


//======================end tracker ===================================
function getJSONObjectForMovieRequirement(req) {
    const json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        const user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({success: false, message: ' A user with that username already exists.'})
                else
                    return res.json(err)
            }
            res.json({success: true, msg: 'Successfully created new user.'})
        });

    }
});

router.post('/signin', function (req, res) {
    const userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err,user){
       if (err){
           res.send(err);
       }
       user.comparePassword(userNew.password, function(isMatch){
           if (isMatch){
               const userToken = {id: user.id, username: user.username};
               const token = jwt.sign(userToken, process.env.SECRET_KEY);
               res.json ({success: true, token: 'JWT ' + token});
           }
           else {
               res.status(401).send({success: false, msg: 'Authentication failed.'});
           }
        })
    })
});
//============ movie =======================
router.route('/Movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find({}, (err, movies) => {
            if (err) return res.status(400).json(err);
            else res.json(movies);
        });
    })

.post(authJwtController.isAuthenticated,function(req, res) {
        if(!req.body.title || !req.body.year || !req.body.genre || !req.body.actorsName[0] || !req.body.actorsName[1] || !req.body.actorsName[2]) {
            res.status(403).json({SUCCESS:false, message: "Error. Incorrect format "});
        }
        else{
            const movie = new Movie();
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.genre = req.body.genre;
            movie.actorsName = req.body.actorsName;

            movie.save(function(err){
                if (err){
                    if(err.code === 11000)
                        return res.json({SUCCESS:false, MESSAGE: "Error. Movie already exists"});
                    else
                        return res.json(err);
                }
            })
            res.json({SUCCESS:true, MESSAGE: "Movie is Created."})
        }
    })
    .put(authJwtController.isAuthenticated, function(req, res) {
        if(!req.body.title|| !req.body.new_title){
            res.status(403).json({SUCCESS:false, message: "Please provide a movie title to be updated along with the new title"})
        }
        else{
            Movie.findOneAndUpdate({title:req.body.title}, {title :req.body.new_title}, function(err, movie){
                if (movie) {
                    res.status(200).json({success: true, message: "Found Movie"})
                }
                else {
                    res.status(404).json({success: false, message: "Movie not found"});
                }
            })
        }
    })
    .delete(authJwtController.isAuthenticated, function(req, res){
        if(!req.body.title){
            res.status(403).json({success:false, message: "Please provide a movie to be delete."});
        }
        else{
            Movie.findOneAndDelete({title:req.body.title}, function(err, movie){
                if (movie){
                    res.status(200).json({success: true, message: "Movie Deleted!", Movie: movie});
                }
                else {
                    res.status(404).json({success:false, message: "Movie was not found!"});
                }
            })
        }
    });
router.route('/movies/:Movie_title')
    .get(authJwtController.isAuthenticated,function(req, res) {
        if(!req.body){
            res.status(403).json({SUCCESS:false, message: "What movie to display?"})
        }
        else{
            Movie.findOne({title:req.body.title}).select("title year genre actorsName").exec(function(err, movie){
                if (movie) {
                    res.status(200).json({success: true, message: " Movie found", Movie: movie})
                }
                else {
                    res.status(404).json({success: false, message: "Movie not found"});
                }
            })
        }
    })

//========================== end movie, start movie review ======================
router.route('/Review')

    .get(authJwtController.isAuthenticated, function (req, res) {
        Reviews.find({}, (err, reviews) => {
            if (err) return res.status(400).json(err);
            else res.json(reviews);
        });
    })
    .post(authJwtController.isAuthenticated,function(req, res) {

        if(!req.body.title || !req.body.reviewName || !req.body.quote || !req.body.rating) {
            res.status(403).json({SUCCESS:false, message: "Error. Incorrect format"});
        }
        else{
            const review = new Reviews();
            review.title = req.body.title;
            review.reviewName = req.body.reviewName;
            review.quote = req.body.quote;
            review.rating = req.body.rating;

            review.save(function(err){
                if (err){
                    if(err.code === 11000)
                        return res.json({SUCCESS:false, MESSAGE: "Error. Movie review already exists"});
                    else
                        return res.json(err);
                }
            })
            res.json({SUCCESS:true, MESSAGE: "Movie review created."})
        }
    });


//========================================================
router.route('/Review/:title')
    // .get(authJwtController.isAuthenticated, function (req, res) {
    //     if ('reviews' in req.query && req.query['reviews'] === 'true'){
    //         Movie.aggregate([
    //             {
    //                 $lookup:
    //                     {
    //                         from: 'reviews',
    //                         localField: 'title',
    //                         foreignField: 'title',
    //                         as: 'movie_and_reviews'
    //                     }
    //             }
    //         ]).then(entries =>
    //             entries.filter(item => item.title === req.query.title).forEach(item => res.json(item)));
    //         return;
    //     }
    //     Movie.findOne( {title: req.query.title}).select('title year genre actorsName').exec(function (err, movie) {
    //         if (err) {
    //             res.send(err);
    //         }
    //         if (movie === null) {
    //             res.send({success: false, message: 'Movie does not exist in the Database.'});
    //             return;
    //         }
    //         let new_Movie = {
    //             title: movie.title,
    //             year: movie.year,
    //             genre: movie.genre,
    //             actorsName: movie.actorsName
    //         }
    //         res.json(new_Movie);
    //     });
    // })
    .get( function (req, res) {
        if (req.query && req.query.reviews && req.query.reviews === "true") {
            Movie.findOne({title: req.params.title}, function (err, movies) {
                if (err) {
                    return res.status(403).json({success: false, message: "Unable to get reviews for title passed in"});
                } else if (!movies) {
                    return res.status(403).json({success: false, message: "Unable to find title passed in."});
                } else {

                    Movie.aggregate()
                        .match({_id: mongoose.Types.ObjectId(movies._id)})
                        .lookup({
                            from: 'reviews',
                            localField: 'title',
                            foreignField: 'title',
                            as: 'movie_and_reviews'})
                        .addFields({averaged_rating: {$avg: "$reviews.rating"}})
                        .exec(function (err, movies) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else {
                                res.json(movies);
                            }
                        })
                }
            })
        } else {

            res = res.status(200);
            res.json({message: 'Reviews not shown.'});
        }
    })
app.use('/', router);
//console.log("http://localhost:8080/test");// tracker
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only
