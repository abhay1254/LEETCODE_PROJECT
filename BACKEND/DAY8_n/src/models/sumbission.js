    const mongoose=require("mongoose");
    const {Schema}=mongoose;
    const User=require("../models/user");
    const Problem=require("../models/problem");
    const submissions=new Schema({
        userId:{
            type:Schema.Types.ObjectId, 
            ref:User,
            require:true,
        },
        problemId:{
            type:Schema.Types.ObjectId,
            ref:Problem,
            require:true,

        },
        
        code:{
            type:String,
            require:true
        },
        language:{
            type:String,
            require:true,
            enum:["c++","js","java"],
        },
        status:{
            type:String,
            enum:["Pending","accepted","wrong","error"],
            default:true,
        },
        runtime:{
            type:Number,
            default:0
        },
        runtime:{
            type:Number,
            default:0,
        },
        memory:{
            type:Number,
            default:0,
        },
        errormessage:{
            type:String,
            default:0,

        },
        testcasespassed:{
            type:Number,
            default:0,

        },
        testcasestotal:{
            type:Number,
            default:0
        },
    },{
            timestamps:true,
        
    })
    submissions.index({userId:1,problemId:1})
    const Sumbit=mongoose.model("sumbit",submissions);
    module.exports=Sumbit;