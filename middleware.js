module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'É preciso estar conectado ao site')
        return res.redirect('/login')
    }
    next();
}

