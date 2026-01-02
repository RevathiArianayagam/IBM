const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: String
});

module.exports = mongoose.model("Student", StudentSchema);
