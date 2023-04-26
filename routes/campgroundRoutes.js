const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const Campground = require("../models/campground");
const { campgroundSchema } = require("../errorSchemas");
//middleware==================================================
const validateCampground = (req, res, next) => {
    //get the error, loop through details array, map => array, join message with
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next(); //is no error, go to post/ put function
    }
};

//path - order is matter========================================
//display all campgrounds
router.get(
    "/",
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

//go to create campground page
router.get("/new", (req, res) => {
    res.render("campgrounds/new");
});

//create campground
router.post(
    "/",
    validateCampground,
    catchAsync(async (req, res, next) => {
        req.flash("success", "Successfully add a new campground!");

        //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

        const campground = new Campground(req.body.campground); //create new campground from req.body
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`); //redirect to the new campground page after created
    })
);

//go to selected campground page
router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id).populate(
            "reviews"
        );
        res.render("campgrounds/show", { campground });

        //get the id from index.ejs, find campground by id, put it to show.ejs
    })
);

//go to edit page
router.get(
    "/:id/edit",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render("campgrounds/edit", { campground });

        //get the selected to edit campground from id from url, inject it to edit page
    })
);

//app.put is used to update resource at the spec path
router.put(
    "/:id",
    validateCampground,
    catchAsync(async (req, res) => {
        //obj destructuring, extract id
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
            //need to use spread obj here bc this method takes an obj w new data
            //need to spread the obj into obj literal to create new obj
            //that contain all original properties along w new data submitted
        });
        req.flash("success", "Successfully updated campground");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted campground");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
