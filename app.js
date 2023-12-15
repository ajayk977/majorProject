const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const MONGO_URL =
  "mongodb://127.0.0.1:27017/majorProjectDB?directConnection=true";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // help to create deferent type of layout
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

// to setup ejs file
const path = require("path");
const { error } = require("console");
const { render } = require("ejs");

//for calling main function
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

//async function for connect database

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("views engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("working");
});

app.get("/Listings",wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//it place upper from show to not make any confusion /Listings/:id and /listings/new
//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//show route
app.get("/Listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

// create route
app.post("/listings", 
wrapAsync(async (req, res, next) => {
  if(!req.body.listing){
    throw new ExpressError(400,"Send valid data for listing")
  }
    const newListing= new Listing(req.body,listing);
    await newListing.save();
    res.redirect("/Listings");
})
);

//Edit Route
app.get("/listings/:id/edit",wrapAsync( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id",wrapAsync( async (req, res) => {
  if(!req.body.listing){
    throw new ExpressError(400,"Send valid data for listing")
  }

  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //...req.body.listing this is the javaScript object  in which all parameters  there we deconstruct and updated value we assign

  res.redirect(`/listings/${id}`);
}));

//delete rout
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));
//check for all rout to send  standard response
app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"))
})

app.use((err, req, res, next) => {
  let{statusCode= 500 ,message="something went wrong"} =err;
  res.render("error.ejs",{message});
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log(" app is connect at 8080");
});
