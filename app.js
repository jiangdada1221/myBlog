//jshint esversion:6
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Yuepeng:jyp267366@cluster0-fxj1l.mongodb.net/blogDB",{ useNewUrlParser: true });
// mongoose.connect("mongodb://localhost:27017/testUser",{ useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret:"jyp is cool",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

const composeSchema = new mongoose.Schema({
  title:String,
  body:String
});

const userSchema = new mongoose.Schema({
  username:String,
  password:String
});


userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const Compose = new mongoose.model("Compose",composeSchema);

app.get("/",function(req,res) {
  Compose.find({},function(err,results){
    res.render("home",{p1:homeStartingContent,posts:results});
  });
});

app.get("/contact",function(req,res) {
  res.render("contact",{p2:contactContent});
});

app.get("/about",function(req,res){
  res.render("about",{p3:aboutContent});
});

app.get("/compose",function(req,res) {
  if(req.isAuthenticated()){
      res.render("compose");
  }
  else {
    res.redirect("/login");
  }
});

app.post("/compose",function(req,res) {

  let title =req.body.pushTitle;
  console.log(title);
  const input = new Compose({
    title:title,
    body:req.body.pushText
  });
  input.save();
  res.redirect("/");
});


app.post("/login",function(req,res){
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });
  console.log(user);
  req.login(user,function(err){
    if(err){console.log(err);}
    else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/compose");
      });
    }
  });
});

app.get("/posts/:name",function(req,res){
  let name = req.params.name;
  console.log(name);
  Compose.findOne({title:name},function(err,results){
    res.render("post",{title:name,body:results.body});
  });
  // posts.forEach(function(element){
  //   if(_.lowerCase(element.title) === name){
  //     res.render("post",{title:element.title,body:element.body});
  //   }
  // });
});

app.get("/login",function(req,res){
  res.redirect("/compose");
});











app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
