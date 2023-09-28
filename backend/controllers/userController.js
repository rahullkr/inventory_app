// const registerUser = (req,res) => {
//     if(!req.body.email){
//         res.status(400);
//             throw new Error('Please enter the email');
//     }
//     res.send('register user');
// }

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { Error } = require('mongoose');

const registerUser  = asyncHandler(async(req,res) =>{
    const {name, email, password} = req.body;

    //validation part karna hoga and for that
    if(!name || !email ||!password){
        res.status(400);
        throw new Error('please fill all the details');
    }
    if(password.length< 8){
        res.status(400);
        throw new Error('password must be of 8 characters');
    }

    // check if email already exist

    const userExist = await User.findOne({email});
    if(userExist){
        res.status(400);
        throw new Error('email already exists');
    }
    const user = await User.create({
        name, email, password
    })
    if(user){
        const {_id, name, email, photo, phone, bio} = user;
        res.status(201).json({
            _id, name, email, photo, phone, bio
        })
    }else{
        res.status(400)
        throw new Error('invalid user data')
    }

});




module.exports = registerUser;