const Campground = require("./models/campground");
const Review = require("./models/review");

const { campgroundSchema, reviewSchema } = require("./errorSchemas");

const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("isLoggedin");
        req.flash("error", "you must be sign in");
        req.session.returnTo = req.originalUrl;

        return res.redirect("/login");
        //have to return bc if not, the code will keep running
    }
    next();
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.validateCampground = (req, res, next) => {
    //get the error, loop through details array, map => array, join message with
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next(); //is no error, go to post/ put function
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission ot do that");
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { campId, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission ot do that");
        return res.redirect(`/campgrounds/${campId}`);
    }

    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next(); //is no error, go to post/ put function
    }
};
