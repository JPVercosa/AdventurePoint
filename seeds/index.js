const mongoose = require('mongoose');

const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("Connected to Mongo")
    })
    .catch(err => {
        console.log("Mongo Connection Error")
        console.log(err)
    });

const seedDB = async () => {
    await Campground.deleteMany({});
    const c = new Campground({ title: 'purple field' })
    await c.save();
}