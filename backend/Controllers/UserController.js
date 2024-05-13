import User from "../Models/UserModel.js";
import bcrypt from "bcryptjs"
import generatetokenandsetcookie from "../Utils/generateTokenandSetCookie.js";
import mongoose from "mongoose";


const signupUser=async(req,res)=>{
    try{
        const {name,email,username,password}=req.body;
        const user=await User.findOne({$or:[{email},{username}]})
        if(user){
            return res.status(400).json({error:"User already exists"})
        }
        const salt =await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt)
        const newUser=new User({
            name,
            email,
            username,
            password: hashedPassword,
        });
        await newUser.save();
        if(newUser){
            generatetokenandsetcookie(newUser._id,res);
            res.status(201).json({
                _id: newUser._id,
                name:newUser.name,
                email:newUser.email,
                username:newUser.username,
                bio: newUser.bio,
                profilePic:newUser.profilePic
            });
        }
        else{
            res.status(400).json({error:"invalid User Data"})
        }
    }
    catch (err){
        res.status(500).json({error:err.message})
        console.log("Error in sinup User: ", err.message)

    }
}
const loginUser=async(req,res)=>{
    try{
        const {username,password}=req.body;
        const user=await User.findOne({username});
        const ispasswordCorrect=await bcrypt.compare(password, user?.password || "")
        if(!user || !ispasswordCorrect) return res.status(400).json({error:"invalid username or password"})
        generatetokenandsetcookie(user._id,res)

        res.status(200).json({
            _id:user._id,
            name:user.name,
            email: user.email,
            username:user.username,
            bio: user.bio,
            profilePic:user.profilePic
        })
    }
    catch(error){
        res.status(500).json({error: error.message});
        console.log("Error in loginUser : ", error.message);

    }
}
const logoutUser=(req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:1});
        res.status(200).json({message:"User Logged out successfully"})
    }
    catch(error){
        res.status(500).json({message: error.message});
        console.log("Error in Sign up User : ", error.message);

    }
}

export {signupUser,loginUser,logoutUser}