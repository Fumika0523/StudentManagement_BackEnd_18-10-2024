const Batch = require('../model/batchNumberModel')


const getAllBatches = async (req,res) => {
try{
    console.log(req.token)
    const getBatchData = await Batch.find()
    if(!getBatchData){
        res.send({message:"The Student Data canot be found"})
    }res.send({batchData:getBatchData})
}catch(e){
    res.send({message:"Some Internal Error"})
}
}
// increment operator

const addBatch = async (req, res) => {
  try {
    // find the last batch (sorted by createdAt descending)
    const lastBatch = await Batch.findOne().sort({ createdAt: -1 });

    let newBatchNo = "BATCH-001"; // default for first batch

    if (lastBatch && lastBatch.batchNo && lastBatch.batchNo.includes("-")) {
      const parts = lastBatch.batchNo.split("-");
      const lastNumber = parseInt(parts[1], 10);
      if (!isNaN(lastNumber)) {
        const nextNumber = lastNumber + 1;
        newBatchNo = `BATCH-${String(nextNumber).padStart(3, "0")}`;
      }
    }
    // create new batch with auto-generated number
    const batchDetail = new Batch({
      ...req.body,
      batchNo: newBatchNo,
    });

    await batchDetail.save();

    res.status(200).send({
      batchDetails: batchDetail,
      message: "Your batch detail has been added!",
    });
  } catch (e) {
    console.error("Error adding batch:", e);
    res.status(500).send({ message: "Some Internal Error" });
  }
}

const nextBatchNumber = async (req, res) => {
  try {
    const lastBatch = await Batch.findOne().sort({ createdAt: -1 });
    let nextBatchNo = "BATCH-001";
    if (lastBatch && lastBatch.batchNumber) {
      const parts = lastBatch.batchNumber.split("-");
      const lastNumber = parseInt(parts[1], 10);

      if (!isNaN(lastNumber)) {
        const newNumber = lastNumber + 1;
        nextBatchNo = `BATCH-${String(newNumber).padStart(3, "0")}`;
      }
    }
    res.status(200).send({ nextBatchNo });
  } catch (err) {
    console.error("Error fetching next batch number:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
}


const updateBatch = async(req,res)=>{
    const updateBatch = await Batch.findOneAndUpdate({_id:req.params.id},req.body,{new:true, runValidators:true})
     try{
        console.log(updateBatch)
        if(!updateBatch){
        return res.send({message:"Can't update the Batch, please check again"})
         }
         res.send({message:"The Batch has been successfully updated",updateBatch})
    }catch(e){
        res.send({message:"Some Internal Error Occur"})
    }
}

const deleteBatch = async(req,res)=>{
    try{
        console.log("Delete Batch by ID",req.params.id)
        const deleteBatch = await Batch.findOneAndDelete({
            _id:req.params.id
        })
        if(!deleteBatch){
            res.send({message:"Batch Not Found"})
        }
        res.send({message:"Batch has been deleted successfully",deleteBatch})
        }catch(e){
            res.send({message:"Some Internal Error"})
        }
}

module.exports = { getAllBatches, addBatch, nextBatchNumber, updateBatch, deleteBatch }