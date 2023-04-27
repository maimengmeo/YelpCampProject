const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");

const Review = require("../models/review");
const Campground = require("../models/campground");

const { validateReview, isLoggedIn, isAuthor } = require("../middleware");

//paths=====================================================
router.post("/:id/reviews", isLoggedIn, validateReview, async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash("success", "Created new Review!");
    res.redirect(`/campgrounds/${campground._id}`);
});

router.delete(
    "/:id/reviews/:reviewId",
    isAuthor,
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;

        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });
        await Review.findById(req.params.reviewId);

        req.flash("success", "Successfully deleted review");
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
