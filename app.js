const express = require('express');
const app = express();                                  //Inicia o Express
const path = require('path');                           //Para configurar o diretório views corretamente a partir de app.set
const mongoose = require('mongoose');                   //Comunicação com o banco de Dados: MongoDB
const methodOverride = require('method-override');      //Possibilita utilizar métodos além de GET e POST
const morgan = require('morgan');                       //Imprime logs de rede no console após conexões [MIDDLEWARE]
const ejsMate = require('ejs-mate');                    //Permite a adição de Layouts
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema } = require('./utils/schemas')


const Campground = require('./models/campground');
const { request } = require('express');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const message = error.details.map(el => el.message).join(', ');
        throw new ExpressError(message, 400);
    } else {
        next()
    }
}


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
app.use(express.urlencoded({ extended: true }));   //Comando para conseguir receber um objeto via Body, com informações que foram enviadas através do método POST via URL
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds: allCampgrounds });
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {

    const newCamp = new Campground(req.body.campground);  //Pegando as informações que vieram via POST de "wwww.../campground/new"
    await newCamp.save();                                 //Salvando o novo modelo de Campground no Mongo
    res.redirect(`/campgrounds/${newCamp._id}`)
}))


app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong"
    res.status(status).render('error', { err })
})

app.listen(3100, () => {
    console.log("Rodando na porta 3100")
})