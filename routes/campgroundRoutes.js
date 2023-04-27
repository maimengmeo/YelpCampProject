const express = require("express");
const router = express.Router();
const campgroundController = require("../controllers/campgroundcontroller");
const catchAsync = require("../utils/catchAsync");

const {
    isLoggedIn,
    isAuthor,
    validateCampground,
    storeReturnTo,
} = require("../middleware");

//path - order is matter========================================
//display all campgrounds
router.get("/", catchAsync(campgroundController.index));

//go to create campground page
router.get("/new", isLoggedIn, campgroundController.newCampgroundForm);

//create campground
router.post(
    "/",
    validateCampground,
    isLoggedIn,
    catchAsync(campgroundController.createCampground)
);

//go to selected campground page
router.get(
    "/:id",
    storeReturnTo,
    catchAsync(campgroundController.showCampground)
);

//go to edit page
router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.editCampgroundForm)
);

//app.put is used to update resource at the spec path
router.put(
    "/:id",
    validateCampground,
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.updateCampground)
);

router.delete(
    "/:id",
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.deleteCampground)
);

module.exports = router;
