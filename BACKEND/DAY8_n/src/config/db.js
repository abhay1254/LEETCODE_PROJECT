const mongoose=require("mongoose");
 
async function main(){
    await mongoose.connect(process.env.db_connect_string);
}
module.exports=main;
