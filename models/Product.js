const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },

    subCategoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubCategory",
        required:true
    },

    name:{
        type:String,
        required:true
    },

    description:{
        type:String
    },

    price:{
        type:Number,
        required:true
    },

    salePrice:{
        type:Number,
        default:0
    },

    stock:{
        type:Number,
        default:0
    },

    images:[
        {
            type:String
        }
    ],

    status:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true
});

module.exports=mongoose.model("Product",productSchema);