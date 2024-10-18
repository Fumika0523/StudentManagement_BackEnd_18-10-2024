const express = require('express')
const app = express()
const Port = 8000

app.get('/',(req,res)=>{
    res.send("Welcome to the App")
})

app.listen(Port,()=>{
    console.log(`Server started at Port no.- ${Port}`)
})