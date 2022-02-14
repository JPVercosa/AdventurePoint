const campground = require('../models/campground');
const Campground = require('../models/campground');

const { cloudinary } = require("../cloudinary/cloudStorage");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN })

module.exports.index = async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds: allCampgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground);                                    //Pegando as informações que vieram via POST de "wwww.../campground/new"
    newCamp.geometry = geoData.body.features[0].geometry;                                   //Adicionando os dados do GeoJSON no Campground e salvando no Mongo
    newCamp.images = req.files.map(file => ({ url: file.path, filename: file.filename }))   //Pegando as imagens com Muter+Cloudinary
    newCamp.author = req.user._id;                                                          //Adicionando a informação de quem é o autor
    await newCamp.save();                                                                   //Salvando o novo modelo de Campground no Mongo
    console.log(newCamp)
    req.flash('success', 'Novo Ponto criado!')
    res.redirect(`/campgrounds/${newCamp._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Ponto não encontrado')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Ponto não encontrado')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }))
    camp.images.push(...imgs)
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({$pull: { images: { filename: { $in: req.body.deleteImages }}}})
    }
    await camp.save()
    req.flash('success', 'Ponto atualizado com sucesso')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Ponto deletado.')
    res.redirect('/campgrounds');
}