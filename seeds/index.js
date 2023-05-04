//this file is ran on its own, separately from node app any time we want to seed the DB

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
//get mongoose model setup
mongoose
    .connect(
        "mongodb+srv://maimengmeo:ayrYa8tr8WsHwTXm@cluster0.uim8xtr.mongodb.net/?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
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

    const allImages = [
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
        {
            url: "https://res.cloudinary.com/donxgudgk/image/upload/v1683233758/YelpCamp/wy5bs2fu8wng3if2twhs.jpg",
            filename: "YelpCamp/wy5bs2fu8wng3if2twhs",
        },
        {
            url: "https://res.cloudinary.com/donxgudgk/image/upload/v1683233759/YelpCamp/cxugexxhkb7ozgsj8pge.jpg",
            filename: "YelpCamp/cxugexxhkb7ozgsj8pge",
        },
        {
            url: "https://res.cloudinary.com/donxgudgk/image/upload/v1683233761/YelpCamp/duy631wmkkshvwdnpeav.jpg",
            filename: "YelpCamp/duy631wmkkshvwdnpeav",
        },
        {
            url: "https://res.cloudinary.com/donxgudgk/image/upload/v1683233763/YelpCamp/tlzokt2gsjyteaiqjzjl.jpg",
            filename: "YelpCamp/tlzokt2gsjyteaiqjzjl",
        },
        {
            url: "https://res.cloudinary.com/donxgudgk/image/upload/v1683233768/YelpCamp/ec5t2whhsmakztellat9.jpg",
            filename: "YelpCamp/ec5t2whhsmakztellat9",
        },
    ];

    for (let i = 0; i < 300; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);

        const price = Math.floor(Math.random() * 20) + 10;

        const image1 = Math.floor(Math.random() * 10);
        const image2 = Math.floor(Math.random() * 10);
        const image3 = Math.floor(Math.random() * 10);
        const campgroundImages = [
            allImages[image1],
            allImages[image2],
            allImages[image3],
        ];

        const c = new Campground({
            author: "6454189ad3b7861698427fb2",
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude,
                ],
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: campgroundImages,
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
