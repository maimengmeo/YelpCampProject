const Campground = require("../models/campground");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

module.exports.newCampgroundForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

    const campground = new Campground(req.body.campground); //create new campground from req.body
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.author = req.user._id;
    await campground.save();

    console.log(campground);

    req.flash("success", "Successfully add a new campground!");
    res.redirect(`/campgrounds/${campground._id}`); //redirect to the new campground page after created
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("author");

    if (!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }

    req.session.returnTo = req.originalUrl;
    res.render("campgrounds/show", { campground });

    //get the id from index.ejs, find campground by id, put it to show.ejs
};

module.exports.editCampgroundForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", { campground });

    //get the selected to edit campground from id from url, inject it to edit page
};

module.exports.updateCampground = async (req, res) => {
    //obj destructuring, extract id
    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
        //need to use spread obj here bc this method takes an obj w new data
        //need to spread the obj into obj literal to create new obj
        //that contain all original properties along w new data submitted
    });
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
};
