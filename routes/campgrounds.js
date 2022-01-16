const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground');
const Review = require('../models/review')
const { campgroundSchema } = require('../utils/schemas')
const { isLoggedIn } = require('../middleware')

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const message = error.details.map(el => el.message).join(', ');
        throw new ExpressError(message, 400);
    } else {
        next()
    }
}

router.get('/', catchAsync(async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds: allCampgrounds });
}))

router.get('/new', isLoggedIn, (req, res) => {

    res.render('campgrounds/new');
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground);  //Pegando as informações que vieram via POST de "wwww.../campground/new"
    await newCamp.save();                                 //Salvando o novo modelo de Campground no Mongo
    req.flash('success', 'Novo Ponto criado!')
    res.redirect(`/campgrounds/${newCamp._id}`)
}))


router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Ponto não encontrado')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Ponto não encontrado')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Ponto atualizado com sucesso')
    res.redirect(`/campgrounds/${id}`)
}))


router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Ponto deletado.')
    res.redirect('/campgrounds');
}))

module.exports = router;
