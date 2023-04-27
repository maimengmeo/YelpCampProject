const User = require("../models/user");

module.exports.loginForm = (req, res) => {
    res.render("users/login");
};

module.exports.registerForm = (req, res) => {
    res.render("users/register");
};

module.exports.userRegister = async (req, res, next) => {
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
};

module.exports.userLogin = (req, res) => {
    req.flash("success", "Welcome back!");
    console.log("returnTo:", res.locals.returnTo);
    const redirectUrl = res.locals.returnTo || "/campgrounds"; // redirect user to the previous page
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Good bye!");
        res.redirect("/campgrounds");
    });
};
