const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const { reviewSchema } = require("../errorSchemas");
const Review = require("../models/review");
const Campground = require("../models/campground");

//middleware================================================
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next(); //is no error, go to post/ put function
    }
};

//paths=====================================================
router.post("/:id/reviews", validateReview, async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
});

router.delete(
    "/:id/reviews/:reviewId",
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;

        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });
        await Review.findById(req.params.reviewId);

        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
