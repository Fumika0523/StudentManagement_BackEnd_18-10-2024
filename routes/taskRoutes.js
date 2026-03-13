const Task = require('./../model/taskModel')
const express = require('express')
const router = express.Router()
const { auth, authorizationRole } = require("../middleware/auth");
const {getAllTasks, addTask, updateTask} =require("../controllers/taskControllers")

router.get('/alltask',getAllTasks)

router.post('/addtask',addTask)

// Put 
router.put('/update-task/:id',updateTask)



module.exports = router