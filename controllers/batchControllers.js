const Batch = require('../model/batchModel')


const getAllBatches = async (req,res) => {
 try{
    //console.log(req.token)
    const getBatchData = await Batch.find()
    if(!getBatchData){
        res.send({message:"The Student Data canot be found"})
    }res.send({batchData:getBatchData})
}catch(e){
    res.send({message:"Some Internal Error"})
}
}

// increment operator
// const addBatch = async (req, res) => {
//   try {
//     const batchDetail = new Batch(req.body);
//     if(!batchDetail){
//       res.status(401).send({message:"Unable to add your batch"})
//      }
//      await batchDetail.save()
//     res.status(200).send({batchDetail:batchDetail,message:"added"})
//   } catch (e) {
//     console.error("Error adding batch:", e);
//     res.status(500).send({ message: "Some Internal Error" });
//   }
// }

const addBatch = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    // Find the last batch for this year
    const lastBatch = await Batch.findOne({ batchNumber: { $regex: `^${year}-` } })
                                 .sort({ seq: -1 });

    let nextSeq = 1; // default for first batch
    if (lastBatch) {
      nextSeq = lastBatch.seq + 1;
    }

    const batchNumber = `${year}-${String(nextSeq).padStart(4, '0')}`;

    // Add the batch number and sequence to req.body
    const batchDetail = new Batch({
      ...req.body,
      batchNumber,
      seq: nextSeq
    });

    await batchDetail.save();

    res.status(200).send({
      batchDetail,
      message: "Batch added successfully!"
    });

  } catch (e) {
    console.error("Error adding batch:", e);
    res.status(500).send({ message: "Some Internal Error" });
  }
};


// const nextBatchNumber = async (req, res) => {
//   try {
//       const year = new Date().getFullYear()
//       const generateSequence = await Batch.findOneAndUpdate(
//             {batchNumber:`batch-${year}`}, //dummy trick
//             {$inc:{seq:1}},
//             {new:true,upsert:true}
//         )
//       // console.log(String(test.seq).padStart(4,"0"))
//       //  console.log(test.seq,text.batchNumber)
//       //  console.log(`${year}-` +String(generateSequence.seq).padStart(4,"0"))
//        const newBatch= `${year}-` +String(generateSequence.seq).padStart(4,"0")
//        console.log("newBatch",newBatch)
//        res.status(201).send({message:"New Batch successfully generated! ",newBatch })
//   } catch (err) {
//     console.error("Error fetching next batch number:", err);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// }

const nextBatchNumber = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    // Find the last batch of this year
    const lastBatch = await Batch.findOne({ batchNumber: { $regex: `^${year}-` } })
                                 .sort({ seq: -1 });

    let nextSeq = 1; // default sequence for first batch
    if (lastBatch) {
      nextSeq = lastBatch.seq + 1;
    }

    const newBatch = `${year}-${String(nextSeq).padStart(4, '0')}`;

    res.status(200).send({
      message: "Next batch number generated successfully!",
      newBatch
    });

  } catch (err) {
    console.error("Error fetching next batch number:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};


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