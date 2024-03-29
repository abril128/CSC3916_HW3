//connecting mongoose
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

//Review schema
const ReviewSchema = new Schema({
    title: {type: String, required: true,},
    reviewName: {type: String, required: true,},
    quote: {type: String, required: true,},
    rating: {type: Number, required: true}

});

//exporting the files
module.exports = mongoose.model('Review', ReviewSchema);