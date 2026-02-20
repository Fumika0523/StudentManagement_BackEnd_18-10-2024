const Task = require('./../model/taskModel')
const express = require('express')
const router = express.Router()

router.post("/addtask",async(req,res)=>{
const taskDetail = new Task( req.body);
    await taskDetail.save();
    res.status(200).send({
      taskDetail,
      message: "Task added successfully!"
    });
});

module.exports = router