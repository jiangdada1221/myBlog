//jshint esversion:6
require('dotenv').config();
const session = require('express-session');
const path = require("path");
const crypto=require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://Yuepeng:jyp267366@cluster0-fxj1l.mongodb.net/blogDB";
// const mongoURI = 'mongodb://localhost:27017/blogDB';
const conn = mongoose.createConnection(mongoURI,{useNewUrlParser: true});
mongoose.connect(mongoURI,{ useNewUrlParser: true });
// mongoose.connect("mongodb://localhost:27017/testUser",{ useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
const homeStartingContent = "耗时一礼拜，总算搭建好个人网站的框架，满满的成就感 will be updated if I have time";
const aboutContent = "Will be updated later";
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
  body:String,
  img:[]
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
app.get("/upload",function(req,res){
  res.render("upload");
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

  const input = new Compose({
    title:title,
    body:req.body.pushText,
    img:[]
  });
  input.save();
  res.redirect("/");
});


app.post("/login",function(req,res){
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,function(err){
    if(err){console.log(err);}
    else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/");
      });
    }
  });
});

app.get("/posts/:name",function(req,res){
  let name = req.params.name;

  Compose.findOne({title:name},function(err,results){
    if(results){
    res.render("post",{title:name,body:results.body,imgs:results.img});}else {
      res.redirect("/");
    }
  });
  // posts.forEach(function(element){
  //   if(_.lowerCase(element.title) === name){
  //     res.render("post",{title:element.title,body:element.body});
  //   }
  // });
});
app.get("/addmore",function(req,res){
  if(req.isAuthenticated()){
    res.redirect("/compose");
  }else {
    res.redirect("/login");
  }
});
app.get("/login",function(req,res){
  if(req.isAuthenticated()){

    res.render("login",{status:true});
  } else {
    res.render("login",{status:false});
  }
});
app.post("/delete",function(req,res){

  let title = req.body.title;
  let status = req.body.button;
  if(req.isAuthenticated()){
    if(status==='false'){
    Compose.findOneAndDelete({title:title},function(err,results){
      if(err) console.log(err);
      else res.redirect("/");
    });} else {
      res.send("wrong???");
    }
  }else {
    res.redirect("/login");
  }
});

// upload
// let gfs;
// conn.once("open",function(err){
//   gfs=Grid(conn.db,mongoose.mongo);
//   gfs.collection("uploads");
//  });
//
//  const storage = new GridFsStorage({
//   url: mongoURI,
//   options:{useNewUrlParser:true},
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = buf.toString('hex') + path.extname(file.originalname);
//         const fileInfo = {
//           filename: filename,
//           bucketName: 'uploads' //should match collection name!
//         };
//         resolve(fileInfo);
//       });
//     });
//   }
// });
//
// const upload = multer({ storage });
//
// app.post("/upload",upload.single('file'),function(req,res){
//   res.redirect("/");
// });


//upload Picture
app.get("/upload/:title",function(req,res){
  Compose.findOne({title:req.params.title},function(err,result){
    if(result) res.render("uploads",{title:req.params.title,imgs:result.img});
    else {
      res.render("uploads",{title:req.params.title,imgs:[]});
    }
  });
});

app.post("/uploads/add",function(req,res){
  let title = req.body.title;
  let uri = req.body.uri;
  console.log("this is triggered");
  if(req.isAuthenticated()){
    Compose.findOne({title:title},function(err,result){
      if(result){
      result.img.push(uri);
      result.save();
      res.redirect("/upload/"+title);}
      else {
        res.redirect("/");
      }
    });
  }else {
    res.redirect("/login");
  }
});

app.post("/deleteUri",function(req,res){
  let title = req.body.title;
  let uri = req.body.deleteUri;
  // console.log(req.body);
  Compose.findOne({title:title},function(err,result){
    if(err) console.log(err);
    else {
      if(result){
        console.log(result);
        result.img = result.img.filter(function(item){
          return item != uri;
        });
        result.save();
        res.redirect('/upload/'+title);
      }else {
        res.render("wrong request!");
      }
    }

  });
});

// confession page
app.get("/myWord",function(req,res){
  res.render('confession');
});



app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
