/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

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
//
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//
app.use(passport.initialize());
//
const router = express.Router();


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
router.route('/movie') // test-collection

    //=========get===============
    .get(function (req, res, next) {
        // Movie.find({}, function(err, movies){
        //     if (err) {
        //         return res.status(400).json({ success: false, error: err })
        //     }
        //     console.log(movies);
        // })
        // Movie.findOne({title: ""}, function(err, movies){
        //     if (err) {
        //         return res.status(400).json({ success: false, error: err })
        //     }
        //     if (!movies){
        //         return res
        //             .status(404)
        //             .json({ success: false, error: `Movie not found` })
        //     }
           // console.log(movies);
       // })
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        const o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    })
    //========end get start post ==============================
    .post(function (req, res, next) {

        console.log(req.body);

        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        const o = getJSONObjectForMovieRequirement(req);
        res.json(o);
    })
    // ==============end post ===================================
    .delete(authController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
        const o = getJSONObjectForMovieRequirement(req);
        res.json(o);
        }
    )
    .put(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
        const o = getJSONObjectForMovieRequirement(req);
        res.json(o);
        }
    );
//========================== end movie ======================

//================================================================================================

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only
