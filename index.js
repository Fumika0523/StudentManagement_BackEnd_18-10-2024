const express = require('express')
const app = express()
const dotenv = require('dotenv') //taking from .env
dotenv.config() //taking from .env
const Port = 8000
const cors = require('cors')
const connection = require('./db/connection')
const userRoutes = require('./routes/userRoutes')

connection()

app.use(express.json())
app.use(cors())
app.get('/',(req,res)=>{
    res.send("Welcome to the App")
})

app.use(userRoutes)

app.listen(Port,()=>{
    console.log(`Server started at Port no.- ${Port}`)
})