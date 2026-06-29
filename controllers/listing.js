const Listing = require("../models/listing");
const maptilerGeocoding = require("../utils/maptiler-geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = maptilerGeocoding({apiKey: mapToken});


module.exports.index = async (req,res)=>{
 const allListings = await Listing.find({});
  res.render("listings/index.ejs",{allListings});
  };

// module.exports.index = async (req,res)=>{
//   const {category} = req.query;
//   let allListings;
//   if(category){
//     allListings = await Listing.find({category});
//   }else{
//     allListings = await Listing.find({});
//   }
//   res.render("listings/index.ejs", {allListings, category});

// };
 

module.exports.renderNewForm = async (req,res)=>{
  console.log(req.user);
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id).populate({ path:"reviews", populate:{ path: "author"},}).populate("owner");
  if (!listing){
     req.flash("error", "Listing you requested for does not exist !");
     return res.redirect("/listings");
  }
  console.log(Listing);
  res.render("listings/show.ejs", {listing});
};


module.exports.createListing = async(req,res,next)=>{

  try{
    const locationString = req.body.listing.location;
    const geoResponse = await geocodingClient.forwardGeocode({
      query: locationString,
      limit:1
    })
    .send();
    const feature = geoResponse.body.features[0];
    if(!feature){
      req.flash("error", "Invalid location");
      return res.redirect("/listings/new");
    }
    const coords = feature.geometry.coordinates;

  let url = req.file?.path;
  let filename = req.file?.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if(url && filename){
       newListing.image = {url, filename}; 
    };
    newListing.geometry = {
      type: "Point",
      coordinates: coords
    };

   let savedListing =  await newListing.save();
   console.log(savedListing);
    req.flash("success","New Listing Created !");
    res.redirect(`/listings/${newListing._id}`);
  } catch(err){
    next(err);
  }
};



module.exports.renderEditForm = async (req,res)=>{
  let { id } = req.params;
  const listing = await Listing.findById(id);
   if (!listing){
     req.flash("error", "Listing you requested for does not exist !");
     return res.redirect("/listings");
  }
let originalImageUrl =   listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req,res)=>{
  let {id} = req.params;
   let listing =   await Listing.findByIdAndUpdate(id, { ...req.body.listing});

   if(typeof req.file !== "undefined"){
     let url = req.file.path;
  let filename = req.file.filename;
  listing.image = {url, filename}; 
  await listing.save();
   }

  req.flash("success", "Listing Updated !");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
      req.flash("success", "Listing Deleted !");
  res.redirect("/listings");
};

module.exports.searchListings = async(req,res)=>{
  const { q } = req.query;
  if(!q){
    req.flash("error", "Please enter a search terms");
    return res.redirect("/listings");
  }
  const listings = await Listing.find({
    $or:[
       {location: {$regex: q, $options: "i"}},
       {country: {$regex: q, $options: "i"}},
      {title:{$regex: q, $options: "i"}},
   
    ]
  });
    res.render("listings/index",{allListings: listings, q});
};









