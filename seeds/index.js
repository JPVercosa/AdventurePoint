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
        const price = Math.floor(Math.random() * 200 + 50);
        const newCamp = new Campground({
            author: '61e469ef35f28207f650a366',
            location: `${cities[rand].city}, ${cities[rand].admin_name}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/829248',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus obcaecati, pariatur praesentium id ducimus odit architecto cum hic! Fuga, temporibus. Necessitatibus cumque sapiente odio sed cupiditate similique qui nihil tempore.',
            price
        })
        await newCamp.save();
    }
    console.log('Novos campos criados!')
}

seedDB().then(() => {
    console.log('Desconectando')
    mongoose.connection.close();
});