module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "you must be sign in");
        return res.redirect("/login");
        //have to return bc if not, the code will keep running
    }
    next();
};
