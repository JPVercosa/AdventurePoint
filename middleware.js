const { campgroundSchema, reviewSchema } = require('./utils/schemas')
const ExpressError = require('./utils/ExpressError')

const Campground = require('./models/campground');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'É preciso estar conectado ao site')
        return res.redirect('/login')
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const message = error.details.map(el => el.message).join(', ');
        throw new ExpressError(message, 400);
    } else {
        next()
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'Você não tem permissão para fazer isso')    
        return res.redirect(`/campgrounds/${campground._id}`)
    } 
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const message = error.details.map(el => el.message).join(', ')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}
