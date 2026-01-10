const mongoose=require("mongoose");
const {Schema}=mongoose;
const User=require("./user")
const problemSchema=new Schema({
    title:{
        type:"String",
        required:true
    },
    description:{
          type:"String",
            required:true
    },
    
       difficulity:{
          type:"String",
       enum:["easy","medium","hard"],
         required:true,
    },
    tags:[{
         type:"String",
         enum:["array","linklist","graph","dp"],
        required:true,

        
    }],
    visibletestcases:[
        {
            input:{
                 type:"String",
           required:true
            },
            output:{
                 type:"String",
               required:true
            
            },
            explaination:{
            type:"String",
            required:true
            },

        }
    ],
    hiddentestcases:[
        {
            
              input:{
       type:"String",
    
  },
  output:{
       type:"String",
     required:true
  
  },
               
        }

    ],
    startcode:[{
        language:{
            type:String,
            required:true,
        },
        intialcode:{
            type:String,
            required:true,
        },
      
      
      
      
      


    }],
      problemcreator:{
       type:Schema.Types.ObjectId,
       ref:"user",
      
  },
    refrenceSoluation:[
        {
            language:{
                type:String,
                required:true,

            },
            completeCode:{
                type:String,
                required:true,
            }
        }
    ],
 acceptanceRate: {
        type: Number,
        default: 0
    },
    totalSubmissions: {
        type: Number,
        default: 0
    },
    totalAccepted: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },




})
const Problem=mongoose.model("problem",problemSchema);
module.exports=Problem;
