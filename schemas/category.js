let mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        default:""
    },
    slug:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})
module.exports = mongoose.model('category',categorySchema)
// Tao 1 schema cho obj category gồm name,description, timestamp