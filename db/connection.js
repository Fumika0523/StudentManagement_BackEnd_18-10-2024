const mongoose = require('mongoose')

const connection=async()=>{
    await mongoose.connect(process.env.MONGO_URL)
    console.log("MONGO DB is conected")
}

module.exports=connection