const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");

const reviewController = require("../controllers/reviewController");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

//paths=====================================================
router.post(
    "/:id/reviews",
    isLoggedIn,
    validateReview,
    reviewController.createReview
);

router.delete(
    "/:id/reviews/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    catchAsync(reviewController.deleteReview)
);

module.exports = router;
