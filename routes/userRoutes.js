const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

const userController = require("../controllers/userController");

const { storeReturnTo } = require("../middleware");

router
    .route("/register")
    .get(userController.registerForm)
    .post(catchAsync(userController.userRegister));

router
    .route("/login")
    .get(userController.loginForm)
    .post(
        storeReturnTo, //to save the returnTo value from session to res.locals
        passport.authenticate("local", {
            //authenticate user before login, if fail, display flash message and redirect to login page
            failureFlash: true,
            failureRedirect: "/login",
        }),
        userController.userLogin
    );

router.get("/logout", userController.logout);

module.exports = router;
