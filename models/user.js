const mongoose=require('mongoose')

const userSchema= new mongoose.Schema({
    xrhsthsID:{
        type:String,
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
          
    },
    firstname:{
        type:String
    },
    lastname:{
        type:String
    },
    email:{
       type:String,
       unique:true
    },
    age:{
        type: Number,
    }
})

module.exports= mongoose.model('User',userSchema)