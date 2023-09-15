const mongoose=require('mongoose')

const adminSchema= new mongoose.Schema({
    
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
          
    },
    
    email:{
       type:String,
       unique:true
    },
   
})

module.exports= mongoose.model('Admin',adminSchema)