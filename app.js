const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

const Campground = require("./models/campground");
const Review = require("./models/review");

const override = require("method-override"); //use to update, delete
const ejsMate = require("ejs-mate"); //npm i ejs-mate first

const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./errorSchemas");

const campgroundRoutes = require("./routes/campgrounds");

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

//middleware set up===============================================================
app.engine("ejs", ejsMate); //tell express we want ejsMate, not the default one
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//tell express to pass the body/ to use req.body
app.use(express.urlencoded({ extened: true }));

app.use(override("_method"));

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next(); //is no error, go to post/ put function
    }
};

//order is matter=================================================================
app.use("/campgrounds", campgroundRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

app.post("/campgrounds/:id/reviews", validateReview, async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
});

app.delete(
    "/campgrounds/:id/reviews/:reviewId",
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;

        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });
        await Review.findById(req.params.reviewId);

        res.redirect(`/campgrounds/${id}`);
    })
);

//error handler===========================================================
//order is matter, if it doesnt match any one above, it will go to here
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render("error", { err });
});
//===================================================================
app.listen(3000, () => {
    console.log("serving on port 3000");
});
