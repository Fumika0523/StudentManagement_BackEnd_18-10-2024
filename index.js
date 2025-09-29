const express = require('express')
const app = express()
const dotenv = require('dotenv') //taking from .env
dotenv.config() //taking from .env
const Port = 8001
const cors = require('cors')
const connection = require('./db/connection')
const userRoutes = require('./routes/userRoutes')
const studentRoutes = require('./routes/studentRoutes')
const admissionRoutes = require('./routes/admissionRoutes')
const courseRoutes = require('./routes/courseRoutes')
const batchRoutes = require('./routes/batchRoutes')
const dashboardRoutes = require('./routes/dashboardRoute')

connection()

app.use(express.json())
app.use(cors())
app.get('/',(req,res)=>{
    res.send("Welcome to the App")
})

app.use(userRoutes)
app.use(studentRoutes)
app.use(admissionRoutes)
app.use(courseRoutes)
app.use(batchRoutes)
app.use(dashboardRoutes)

app.listen(Port,()=>{
    console.log(`Server started at Port no.- ${Port}`)
})
