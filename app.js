const express = require('express');
const app = express();                                  //Inicia o Express
const path = require('path');                           //Para configurar o diretório views corretamente a partir de app.set
const mongoose = require('mongoose');                   //Comunicação com o banco de Dados: MongoDB
const methodOverride = require('method-override');      //Possibilita utilizar métodos além de GET e POST
const morgan = require('morgan');                       //Imprime logs de rede no console após conexões
const ejsMate = require('ejs-mate');                    //Permite a adição de Layouts

const Campground = require('./models/campground');
const { request } = require('express');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("Connected to Mongo")
    })
    .catch(err => {
        console.log("Mongo Connection Error")
        console.log(err)
    });

app.engine('ejs', ejsMate);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan(':method ":url" :status :res[content-type] :remote-addr - :response-time ms'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds: allCampgrounds });
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`)
})


app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground })
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })

})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})


app.listen(3100, () => {
    console.log("Rodando na porta 3100")
})