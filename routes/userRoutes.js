const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { render } = require("ejs");
const { storeReturnTo, isLoggedIn } = require("../middleware");

router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post(
    "/register",
    catchAsync(async (req, res, next) => {
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const registeredUser = await User.register(user, password);

            req.login(registeredUser, (err) => {
                if (err) {
                    return next(err);
                }
                req.flash("success", "Welcome to Yelp Camp");
                res.redirect("/campgrounds");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/register");
        }
    })
);

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post(
    "/login",
    storeReturnTo, //to save the returnTo value from session to res.locals
    passport.authenticate("local", {
        //authenticate user before login, if fail, display flash message and redirect to login page
        failureFlash: true,
        failureRedirect: "/login",
    }),
    (req, res) => {
        req.flash("success", "Welcome back!");
        console.log("returnTo:", res.locals.returnTo);
        const redirectUrl = res.locals.returnTo || "/campgrounds"; // redirect user to the previous page
        res.redirect(redirectUrl);
    }
);

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Good bye!");
        res.redirect("/campgrounds");
    });
});

module.exports = router;
