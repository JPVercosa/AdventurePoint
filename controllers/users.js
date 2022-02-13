const User = require('../models/user');


module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username });
        const registerUser = await User.register(user, password)
        req.login(registerUser, err => {
            if (err) return next(err);
            req.flash('succes', "Bem vindo ao AdventurePoint")
            res.redirect('/campgrounds')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }

}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = (req, res) => {
    req.flash('success', "Bem vindo de volta!")
    if(!req.session.returnTo){
        return res.redirect('/campgrounds')
    }
    const redirectUrl = req.session.returnTo
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res) => {
    req.logout()
    req.flash('success', 'Até mais!')
    res.redirect('/campgrounds')
}