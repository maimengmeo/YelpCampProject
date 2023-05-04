const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeoCoding({ accessToken: mapBoxToken });

const paginate = require("express-paginate");

module.exports.index = async (req, res, next) => {
    try {
        const allCampgrounds = await Campground.find({});

        const [results, itemCount] = await Promise.all([
            Campground.find({}).limit(10).skip(req.skip).lean().exec(),
            Campground.count({}),
        ]);
        const pageCount = Math.ceil(itemCount / 10);
        const currentPage = req.query.page || 1;

        res.render("campgrounds/index", {
            campgrounds: results,
            allCampgrounds,
            pageCount,
            itemCount,
            currentPage,
            pages: paginate.getArrayPages(req)(3, pageCount, req.query.page),
        });
    } catch (err) {
        next(err);
    }

    // res.render("campgrounds/index", { campgrounds });
};

module.exports.newCampgroundForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

    //this method is used to convert location search string into
    //corresponding geographic coordinates (lat & long)
    const geoData = await geoCoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send(); //forward() returns req obj, send() actually send req & retrieve data

    // create new campground with data from html form,
    //add images, owner/creater, geometry
    const campground = new Campground(req.body.campground); //create new campground from req.body
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.author = req.user._id;
    campground.geometry = geoData.body.features[0].geometry;
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
    const images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    //add more image
    campground.images.push(...images);

    await campground.save();

    console.log(cloudinary);
    //delete image
    if (req.body.deleteImages) {
        console.log(req.body.deleteImages);

        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
    }

    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
};

module.exports.searchCampground = async (req, res) => {
    try {
        const { keyword } = req.query;
        const campgrounds = await Campground.find({
            title: { $regex: `${keyword}`, $options: "i" },
        });

        res.render("campgrounds/index", { campgrounds });
    } catch (e) {
        console.log(e);
    }
};

module.exports.bookCampground = async (req, res) => {
    // try {
    //     const {checkin, checkout} = req.body;
    // }
};
