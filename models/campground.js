const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function (){
    return this.url.replace('/upload', '/upload/w_200')
})

ImageSchema.virtual('fullHeight').get(function (){
    return this.url.replace('/upload', '/upload/c_thumb,h_200,w_400')
})


const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}) 

CampgroundSchema.set('toJSON', { virtuals: true });

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<h6><a href="/campgrounds/${this._id}">${this.title}<a></h6>
    <p>${this.description.substring(0,20)}...</p>
    <p>R$${this.price.toFixed(2)}</p>`  
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);