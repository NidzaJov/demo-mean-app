const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const path = require("path");

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect(`mongodb+srv://sedcuser:${process.env.MONGO_ATLAS_PW}@cluster0.jkazo.mongodb.net/demo?retryWrites=true&w=majority`)
.then(() => {
  console.log('Connected to database');
})
.catch(() => {
  console.log("Connection failed!")
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("", express.static(path.join(__dirname, "angular")));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader("Access-Control-Allow-Headers", "X_Requested_With, Content-Type, Accept, Authorization");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );
  next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", "index.html"));
})

module.exports = app;
