const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;


const Movie = new Schema(
    {
        title: { type: String, required: true },
        releaseYear: { type: Number, required: true },
        genre: { type: [String], required: true },
        actors: { type: [String], required: true },
    },
    { timestamps: true },
)

module.exports = mongoose.model('movies', Movie)
