const express = require('express')
const app = express()
const Port = 8000
configDotenv.config()
const connection = require('.db/connection')
const userRoutes = require('./routes/userRoutes')

connection()

app.use(express.json())
app.get('/',(req,res)=>{
    res.send("Welcome to the App")
})

app.use(userRoutes)

app.listen(Port,()=>{
    console.log(`Server started at Port no.- ${Port}`)
})