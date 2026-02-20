// models/taskModel.js
const mongoose = require("mongoose");

const taskQuestionSchema = new mongoose.Schema(
  {
    taskQuestion: {
      type: String,
      required: true,
      trim: true,
    },
    batchNumber: {
      type: String, 
      required: true,
      trim: true,
    },
  },
  { _id: true } // default is true anyway; subdocs will have _id
);

const taskSchema = new mongoose.Schema(
  {
    taskCourseName: {
      type: String,
      required: true,
      trim: true,
    },


    taskDetail: {
      type: [taskQuestionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
