const Joi = require("joi");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const Admin = require("./models/admin");
const auth = require("./middleware/auth");
const axios = require("axios");

mongoose.connect("mongodb://localhost/users", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database!"));

app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/assets", express.static("assets"));
app.use(cookieParser());
//app.use(express.static('./views'))
app.use(express.urlencoded({ extended: false }));


app.get("/", function (req, res, next) {
  res.render("index1");
});

app.get("/index", auth, function (req, res, next) {
  res.render("index");
});

app.get("/url", function (req, res, next) {
  res.render("searchurl");
});

app.get("/search", auth, express.json(), function (req, res, next) {
  const apiAPI = "AIzaSyBAAAH-3lsqLviTS2YclBm7IJ9MeHF1P3Q";
  const searchEngineID = "004377872228925320789:cweix2nqocd";

  //let userInput = req.body.searchinput;
  res.send({ userInput: req.body.searchinput });
});

app.post("/search", auth, express.json(), function (req, res, next) {
  const apiAPI = "AIzaSyBAAAH-3lsqLviTS2YclBm7IJ9MeHF1P3Q";
  const searchEngineID = "004377872228925320789:cweix2nqocd";

  let userInput = req.body.searchinput;

  axios
    .all([
      axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${apiAPI}&cx=${searchEngineID}&q=${userInput}`
      ),
      axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${apiAPI}&cx=${searchEngineID}&q=${userInput}&start=11`
      ),
      axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${apiAPI}&cx=${searchEngineID}&q=${userInput}&start=21`
      ),
    ])
    .then(
      axios.spread((results1, results2, results3) => {
        let data = results1.data.items;
        let recorder = [];
        results1.data.items.forEach((item) => {
          recorder.push({
            displayLink: item.displayLink,
            snippet: item.snippet,
          });
        });
        results2.data.items.forEach((item) => {
          recorder.push({
            displayLink: item.displayLink,
            snippet: item.snippet,
          });
        });
        results3.data.items.forEach((item) => {
          recorder.push({
            displayLink: item.displayLink,
            snippet: item.snippet,
          });
        });

        res.send(recorder);
      })
    );
});

app.post("/listusers", auth, express.json(), function (req, res, next) {
  const user = new User({
    xrhsthsID: req.xrhsths,
    username: req.body.username,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    age: req.body.age,
  });
  user
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));
  res.send("created");
});

app.put("/listusers/:id", auth, express.json(), function (req, res, next) {
  User.findByIdAndUpdate(req.params.id, {
    username: req.body.username,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    age: req.body.age,
  })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));
  res.send("updated");
});

app.delete("/listusers/:id", auth, express.json(), function (req, res) {
  User.findByIdAndDelete(req.params.id, {})

    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));
  res.send("ok");
});

app.get("/listusers", auth, function (req, res, next) {
  let adminID = req.xrhsths;
  User.find({ xrhsthsID: adminID }).exec(function (err, users) {
    console.log(users);
    if (err) throw err;
    res.render("listusers", { users: users });
  });
});

app.get("/listusers2", auth, function (req, res, next) {
  let adminID = req.xrhsths;
  User.find({ xrhsthsID: adminID }).exec(function (err, users) {
    if (err) throw err;
    res.send(users);
  });
});

app.get("/getusersById/:id", function (req, res, next) {
  console.log(req.params);
  User.find({ _id: req.params.id }).exec(function (err, users) {
    if (err) throw err;
    res.send(users);
  });
});

app.post("/signup", express.json(), async (req, res) => {
  const admin = new Admin({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
  });
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
  admin
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));
  const token = jwt.sign({ _id: admin._id }, "jwtPrivateKey");
  res.send(token);
});

app.post("/login", express.json(), async (req, res) => {
  let admin = await Admin.findOne({ username: req.body.username });
  if (!admin) return res.status(400).send("Invalid username or password ");

  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword)
    return res.status(400).send("Invalid username or password");

  //const token=xrhsths.generateAuthToken()
  const token = jwt.sign({ _id: admin._id }, "jwtPrivateKey");
  // {xrhsths.username=username}
  res.send({ token, username: req.body.username });
});

app.listen(5000, () => console.log("The server has started on port 5000!"));
