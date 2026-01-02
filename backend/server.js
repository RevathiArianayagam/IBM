const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/studentdb")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const studentRoutes = require("./routes/studentRoutes");
app.use("/students", studentRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
