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
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
     allocatedDay:{
      type:Number,
      required:true,
    }
  },
  { _id: true } // mongoose generated id
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
