const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

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
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

//create campground
router.post(
    "/",
    validateCampground,
    isLoggedIn,
    catchAsync(async (req, res, next) => {
        //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
        const campground = new Campground(req.body.campground); //create new campground from req.body
        campground.author = req.user._id;
        await campground.save();

        req.flash("success", "Successfully add a new campground!");
        res.redirect(`/campgrounds/${campground._id}`); //redirect to the new campground page after created
    })
);

//go to selected campground page
router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id)
            .populate("reviews")
            .populate("author");

        if (!campground) {
            req.flash("error", "Cannot find that campground");
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/show", { campground });

        //get the id from index.ejs, find campground by id, put it to show.ejs
    })
);

//go to edit page
router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);

        if (!campground) {
            req.flash("error", "Cannot find that campground");
            return res.redirect("/campgrounds");
        }

        res.render("campgrounds/edit", { campground });

        //get the selected to edit campground from id from url, inject it to edit page
    })
);

//app.put is used to update resource at the spec path
router.put(
    "/:id",
    validateCampground,
    isLoggedIn,
    isAuthor,
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
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted campground");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
