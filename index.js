const express = require("express");
const cors =require("cors");
const mongoose=require("mongoose");
const app = express();
const bcrypt=require("bcrypt");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
const port = 3001;
mongoose.connect("mongodb+srv://harshitshharma:techway007@cluster0.nw7wb.mongodb.net/users?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
console.log("DB Connected");
//user schema 
// const userSchema = new mongoose.Schema({
//     name: {
//         type:String,
//         required:true
//     },
//     email: {
//         type:String,
//         required:true
//     },
//     password:  {
//         type:String,
//         required:true
//     }
// })
const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    password:  {
        type:String,
        required:true
    },
    movies:{
        type:Array
    }
})
const User = new mongoose.model("users", userSchema)
app.post("/signin",async (req, res)=> {
    const { email, password} = req.body;
   await User.findOne({email:email}).then(async (user, err) => {
    //    console.log(user)
        if(user){
            await bcrypt.compare(password, user.password, function(err, isValid) {
                if (isValid) {
                    res.status(200).send({message: "Login Successfull", user: user});
                }
                else {
                    res.status(400).send({ message: "Password didn't match"})
                }
              });
        } else {
            res.status(401).send({message: "User not registered"})
        }
    })
}) 
app.post("/register",(req,res)=>{
    // console.log(req.body);
    var {name,email,password} =req.body;
    User.findOne({email:email},async (err,user)=>{
        if(user){
           return res.status(400).json({message:"user already exist"})
        }else {
            const saltRounds=12;
            //bcrypt.hashSync
            bcrypt.hash(password, saltRounds,async function(err, hash) {
                password=hash;         
                const user = new User({name,email,password})
                console.log(user)
                await user.save(err=>{
                    if(err){
                        return res.status(400).json(err)
                    }else{
                        return res.status(200).json({message:"successfull"})
                    }
                })
            });
        }
    })
})

app.put("/updateFavourites/:id",(req,res)=>{
    var userId =req.params.id;
    // await User.updateOne({_id:userId},{
    //     $push: { movies: movie }
    // })
    // console.log(req.body);

     User.updateOne({_id:userId}, 
        {
              movies: req.body
            }, (err, ress)=> {
        if (err){
            console.log("Trouble adding movie to current user "+err)
        }
        else{
            console.log("Favourites updated for current user");
            // return res.status(200).json({message:"successfull query"});
        }
    });
})
app.get("/",(req,res)=>{
    res.send("Backend server working!");
})
app.get("/getMovies/:id",(req,res)=>{
    User.findOne({_id:req.params.id}, function (err, results) {
        if (err){
            // console.log(err)
        }
        else{
            // console.log("Result : ", results.movies);
            return res.status(200).json({message:"Movies fetched successfully",movies:results.movies});
        }
    });
   
})

app.listen(process.env.PORT || 5000,()=>{
    console.log("started")
})