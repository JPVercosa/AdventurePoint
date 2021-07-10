const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("Connected to Mongo")
    })
    .catch(err => {
        console.log("Mongo Connection Error")
        console.log(err)
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand = Math.floor(Math.random() * 474);
        const newCamp = new Campground({
            location: `${cities[rand].city}, ${cities[rand].admin_name}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await newCamp.save();
    }
    console.log('Novos campos criados!')
}

seedDB().then(() => {
    console.log('Desconectando')
    mongoose.connection.close();
});