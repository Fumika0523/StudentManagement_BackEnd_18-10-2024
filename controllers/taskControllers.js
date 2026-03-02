const Task = require('../model/taskModel')

const getAllTasks = async(req,res)=>{
try{
    const getTaskData = await Task.find()
    if(!getTaskData){
        res.send({message:"The task Data not found"})
    }res.send({taskData:getTaskData})
}catch(e){
        res.send({message:"Some Internal Error"})
}}

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

const updateTask = async(req,res)=>{
  
    const updateTask = await Task.findOneAndUpdate(
        {_id:req.params._id},
        req.body,
        {
        new:true,
        runValidators:true
        }
    )
  try{
    console.log("updateTask",updateTask)
    if(!updateTask){
        if(!updateTask){
            return res.send({message:"Cannot update the task, please check again"})
        }
        res.send({message:"The task has been successfully updated", updateTask})
    }
    }catch(e){
        console.error("Error adding task:",e)
        res.status(500).send({message:"Some Internal Error"})
    }
}
module.exports={getAllTasks, addTask, updateTask}