import mongoose from 'mongoose';
export default mongoose.Schema({
    "id":{
        "type":String,
        "required":true,
        "unique":true
    },
    "pw":{
        "type":String,
        "required":true
    }
});