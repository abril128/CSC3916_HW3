const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const bcrypt = require('bcrypt-nodejs');// incript paswords

mongoose.Promise = global.Promise;

//mongoose.connect(process.env.DB, { useNewUrlParser: true });

//mongoose.set('useCreateIndex', true);


const MovieSchema = new Schema(
    {
        title: { type: String, required: true, index: { unique: true}},
        releaseYear: { type: Number, required: true },
        genre: { type: [String], required: true },
        actors: { type: [String], required: true },
    },
    { timestamps: true },
)

module.exports = mongoose.model('movies', MovieSchema)