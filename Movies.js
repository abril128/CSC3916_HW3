const mongoose = require('mongoose');
const Schema = mongoose.Schema;


mongoose.Promise = global.Promise;

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}

//mongoose.set('useCreateIndex', true);


const MovieSchema = new Schema(
    {
        title: { type: String, required: true, index: { unique: true}},
        releaseYear: { type: Number, required: true },
        genre: { type: [String], required: true },
        actors: { type: [String], required: true },
    }

)

module.exports = mongoose.model('movies', MovieSchema)
