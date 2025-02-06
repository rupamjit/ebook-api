import express from "express"

const app = express()


// Routes
app.get("/",(req,res)=>{
    res.json({message:"ebook api"})
})

export default app;
