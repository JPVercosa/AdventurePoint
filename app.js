const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// const methodOverride = require('method-override')

const Campground = require('./models/campground');
const { request } = require('express');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("Connected to Mongo")
    })
    .catch(err => {
        console.log("Mongo Connection Error")
        console.log(err)
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(express.urlencoded({ extended: true }))
// app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(3100, () => {
    console.log("Rodando na porta 3100")
})