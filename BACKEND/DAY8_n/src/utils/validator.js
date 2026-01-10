const validator=require("validator");
const validate=(data)=>{
    const mandatoryfield=['firstname','emailId','password'];
     const isallowed=(mandatoryfield.every((k)=>Object.keys(data).includes(k)));
        if(!isallowed){
            throw new Error("Some Field Missing");
        }
        if(!validator.isEmail(data.emailId)){
            throw new Error("Invalid Email");
        }
        if(!validator.isStrongPassword(data.password)){
            throw new Error("Enter strong password");
        }
        // if(!(data.firstname).length<3 || (data.firstname).length>20){
            // throw new Error("Min Or Max Lenth Reached")
        // }

}
module.exports=validate;