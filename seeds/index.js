//this file is ran on its own, separately from node app any time we want to seed the DB

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
//get mongoose model setup
mongoose
    .connect("mongodb://127.0.0.1:27017/YelpCamp", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connection open");
    })
    .catch((err) => {
        console.log("Connection Error");
        console.log(err);
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

//create multiple campground
const seedDB = async () => {
    await Campground.deleteMany({}); //delete everything to avoid redundant data on every run

    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);

        const price = Math.floor(Math.random() * 20) + 10;

        const c = new Campground({
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/483251",
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo magni, sapiente voluptas commodi incidunt voluptatem veritatis harum voluptates facere maxime eius vero dolor atque fuga laudantium omnis minima consequatur mollitia.",
            price,
        });

        await c.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close(); //close connection of this file
});
