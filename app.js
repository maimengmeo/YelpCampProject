const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");

//get mongoose model setup====================================
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

//===============================================================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//tell express to pass the body
app.use(express.urlencoded({ extedned: true }));
//=================================================================
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.post("/campgrounds", async (req, res) => {
    const campground = new Campground(req.body.campground); //create new campground from req.body
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`); //redirect to the new campground page after created
});

app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });

    //get the id from index.ejs, find campground by id, put it to show.ejs
});

// app.get("/makeCampground", async (req, res) => {
//     const camp = new Campground({
//         title: "My Backyard",
//         description: "cheap camping",
//     });
//     await camp.save();
//     res.send(camp);
// });

//===================================================================
app.listen(3000, () => {
    console.log("serving on port 3000");
});
