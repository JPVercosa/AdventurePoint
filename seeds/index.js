if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places, boas, ruins, neutras } = require('./seedHelpers');
const Campground = require('../models/campground');

const { Configuration, OpenAIApi} = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("Connected to Mongo")
    })
    .catch(err => {
        console.log("Mongo Connection Error")
        console.log(err)
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const createDescription = async (title) => {

    const response = await openai.createCompletion("text-davinci-001", {
        prompt: `Crie uma descrição para o ponto turístico\n\nNome: ${title}\n Algumas características: ${sample(boas)}, ${sample(ruins)}, ${sample(neutras)}\n\n`,
        temperature: 0.5,
        max_tokens: 64,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      })
    
    console.log(response.data.choices[0].text)
    return response.data.choices[0].text
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 5; i++) {
        const rand = Math.floor(Math.random() * 474);
        const price = Math.floor(Math.random() * 200 + 50);
        const title = `${sample(descriptors)} ${sample(places)}`
        const description = await createDescription(title)
        const newCamp = new Campground({
            author: '61e469ef35f28207f650a366',
            location: `${cities[rand].city}, ${cities[rand].admin_name}`,
            title: title,
            description: description,
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/adventurepoint/image/upload/v1644775070/AdventurePointsImages/a5qmtn5pb4c7ieljiqnw.jpg',
                  filename: 'AdventurePointsImages/a5qmtn5pb4c7ieljiqnw'
                },
                {
                  url: 'https://res.cloudinary.com/adventurepoint/image/upload/v1644775071/AdventurePointsImages/pibwubaommfcueeyny8i.jpg',
                  filename: 'AdventurePointsImages/pibwubaommfcueeyny8i'
                },
                {
                  url: 'https://res.cloudinary.com/adventurepoint/image/upload/v1644775071/AdventurePointsImages/ku5fuwdmo7hldawiv4dp.jpg',
                  filename: 'AdventurePointsImages/ku5fuwdmo7hldawiv4dp'
                }
              ]
        })
        await newCamp.save();
    }
    console.log('Novos campos criados!')
}

seedDB().then(() => {
    console.log('Desconectando')
    mongoose.connection.close();
});