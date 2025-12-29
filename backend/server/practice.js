const express=require("express");
const cors=require("cors");
const app=express();
app.use(cors());
app.use(express.json());

app.get("/api/data",(req,res)=>{
    res.json({
        msg:"hello from Pranay Bhere",
        message: "Hello from Express Backend",
        users:["Pranay","Jay","Soham","Roshan"] 
    });
});

app.listen(5000,()=>console.log("Server Runing at 5000 port"));