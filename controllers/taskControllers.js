const Task = require('../model/taskModel')
// req = request from frontend
// res = response sent back to frontend

//GET: All Task 
const getAllTasks = async(req,res)=>{
try{
    const getTaskData = await Task.find()
    if(!getTaskData){
        res.send({message:"The task Data not found"})
    }res.send({taskData:getTaskData})
}catch(e){
        res.send({message:"Some Internal Error"})
}}

// POST: Task
const addTask = async(req,res)=>{
try{
    const taskDetail = new Task(req.body)
    if(!taskDetail){
        res.status(401).send({message:"Unable to add your Task details"})
    } await taskDetail.save()
    res.status(200).send({
        taskDetail:taskDetail,
        message:"Your Task details has successfully been added!"})
}catch(e){
    console.error("Error adding task:",e)
    res.status(500).send({message:"Some Internal Error"})
}
}

//PUT: update
const updateTask = async (req, res) => {
  try {
    //if route is /update-task/123
    // req.params >> { id: "123" }
    console.log("req.params:", req.params); //req.params: { id: '6998135064dc20706affca70' }
    //req.body: { batchId: '69af6ee5cef735dc40ea9217', batchNumber: '2026-0002' }
    console.log("req.body:", req.body); //batchNum

    const taskDetailId = req.params.id;
    const { batchNumber } = req.body;

    if (!batchNumber) {
      return res.status(400).json({ message: "batchNumber is required" });
    }
//  find  taskDetail._id matches the id from the URL
    const updatedTask = await Task.findOneAndUpdate(
      { "taskDetail._id": taskDetailId },
      {
       // $addToSet adds batchNumber into the array only if it does not already exist to prevents duplicate batch num.
        $addToSet: {
          "taskDetail.$.batchNumber": batchNumber,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    console.log("updatedTask", updatedTask);

    if (!updatedTask) {
      return res.status(404).json({ message: "Task detail not found" });
    }

    return res.status(200).json({
      message: "Batch assigned successfully",
      updatedTask,
    });
  } catch (e) {
    console.error("updateTask error:", e);
    return res.status(500).json({
      message: "Internal server error",
      error: e.message,
    });
  }
};

module.exports={getAllTasks, addTask, updateTask}