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

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
//path - order is matter========================================

router
    .route("/")
    .get(catchAsync(campgroundController.index)) //display all campgrounds
    // .post(
    //     //create campground
    //     isLoggedIn,
    //     validateCampground,
    //     catchAsync(campgroundController.createCampground)
    // );
    .post(upload.array("image"), (req, res) => {
        console.log(req.body, req.files);
    });

//go to create campground page
router.get("/new", isLoggedIn, campgroundController.newCampgroundForm);

router
    .route("/:id")
    .get(storeReturnTo, catchAsync(campgroundController.showCampground)) //go to selected campground page
    .put(
        //app.put is used to update resource at the spec path
        validateCampground,
        isLoggedIn,
        isAuthor,
        catchAsync(campgroundController.updateCampground)
    )
    .delete(
        isLoggedIn,
        isAuthor,
        catchAsync(campgroundController.deleteCampground)
    );

//go to edit page
router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.editCampgroundForm)
);

module.exports = router;
