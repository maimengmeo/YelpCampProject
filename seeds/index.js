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
            author: "6449c0eb98d4d4bea7cc5291",
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            geometry: { type: "Point", coordinates: [-79.666672, 43.447436] },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: "https://res.cloudinary.com/donxgudgk/image/upload/v1682696787/YelpCamp/vat5hk08twtbumvokk4g.jpg",
                    filename: "YelpCamp/vat5hk08twtbumvokk4g",
                },
                {
                    url: "https://res.cloudinary.com/donxgudgk/image/upload/v1682696790/YelpCamp/rr5bxk5no2q63ia3lznr.jpg",
                    filename: "YelpCamp/rr5bxk5no2q63ia3lznr",
                },
                {
                    url: "https://res.cloudinary.com/donxgudgk/image/upload/v1682696792/YelpCamp/fmfmp40rclefbt98oh2f.jpg",
                    filename: "YelpCamp/fmfmp40rclefbt98oh2f",
                },
                {
                    url: "https://res.cloudinary.com/donxgudgk/image/upload/v1682696798/YelpCamp/utdxien5ltqvhqczuhau.jpg",
                    filename: "YelpCamp/utdxien5ltqvhqczuhau",
                },
                {
                    url: "https://res.cloudinary.com/donxgudgk/image/upload/v1682696800/YelpCamp/o0ljksfpk9mn48thy2ax.jpg",
                    filename: "YelpCamp/o0ljksfpk9mn48thy2ax",
                },
            ],
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
