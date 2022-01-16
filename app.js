const express = require('express');
const session = require('express-session')
const app = express();                                  //Inicia o Express
const path = require('path');                           //Para configurar o diretório views corretamente a partir de app.set
const mongoose = require('mongoose');                   //Comunicação com o banco de Dados: MongoDB
const methodOverride = require('method-override');      //Possibilita utilizar métodos além de GET e POST
const morgan = require('morgan');                       //Imprime logs de rede no console após conexões [MIDDLEWARE]
const ejsMate = require('ejs-mate');                    //Permite a adição de Layouts
const flash = require('connect-flash')                  //Permite a adição de notificações
const passport = require('passport');
const localPassport = require('passport-local');


const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')

//Models
const Campground = require('./models/campground');
const Review = require('./models/review')
const User = require('./models/user')



//Rotas
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const usersRoutes = require('./routes/users')


const sessionConfig = {
    secret: 'MYSECRET',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
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

app.use(express.urlencoded({ extended: true }));   //Comando para conseguir receber um objeto via Body, com informações que foram enviadas através do método POST
app.use(methodOverride('_method'));                //Utiliza Query string para alterar o tipo método enviando por um formulário.
app.use(morgan(':method ":url" :status :res[content-type] :remote-addr - :response-time ms'));  //Printa conexões no console
app.use(express.static(path.join(__dirname, 'public')))
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session())

passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next) => {
    res.locals.flashSuccess = req.flash('success');
    res.locals.flashError = req.flash('error')
    next();
})



app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', usersRoutes);

app.get('/', (req, res) => {
    res.render('home');
})

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