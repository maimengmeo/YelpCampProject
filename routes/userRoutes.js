const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

const userController = require("../controllers/userController");

const { storeReturnTo } = require("../middleware");

router.get("/register", userController.registerForm);

router.post("/register", catchAsync(userController.userRegister));

router.get("/login", userController.loginForm);

router.post(
    "/login",
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
