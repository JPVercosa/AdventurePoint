module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'É preciso estar conectado ao site')
        return res.redirect('/login')
    }
    next();
}

