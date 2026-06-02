const mongoose=require("mongoose");
//  require("dotenv").config();
 require("dotenv").config();
async function main(){
    await mongoose.connect(process.env.db_connect_string);
}
module.exports=main;


// async is used in javascript to handle asynchronous operations.If javascript waits normally the whole program get stuck until the operation is completed but Async make a function aschcronus it automatically return a promise