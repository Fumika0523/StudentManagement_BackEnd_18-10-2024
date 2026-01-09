const express = require('express')
const app = express()
const dotenv = require('dotenv') //taking from .env
dotenv.config() //taking from .env
const Port = 8001
const passport = require('passport')
require('./passport.Config.js')
const cors = require('cors')
const connection = require('./db/connection')
const userRoutes = require('./routes/userRoutes')
const studentRoutes = require('./routes/studentRoutes')
const admissionRoutes = require('./routes/admissionRoutes')
const courseRoutes = require('./routes/courseRoutes')
const batchRoutes = require('./routes/batchRoutes')
const dashboardRoutes = require('./routes/dashboardRoute')
const session = require('express-session');

connection()

app.use(express.json())

//set cookie
app.use(cors({
    origin: 'http://localhost:5173', // when it's production?
    credentials:true,
}))

app.use(express.json())
app.use(session({
    secret:process.env.secret,
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false}
}))

// app.get('/',(req,res)=>{
//     res.send("Welcome to the App")
// })

//passport
app.use(passport.initialize())
app.use(passport.session())

app.use(userRoutes)
app.use(studentRoutes)
app.use(admissionRoutes)
app.use(courseRoutes)
app.use(batchRoutes)
app.use(dashboardRoutes)
// app.use("/api", require("./utils/testEmail"));

// app.get('/',(req,res)=>{
//     res.send("Welcome to the App")
//     if(!req.user)
//     return res.json({loggedIn:false})
//     res.json({loggedIn:true,user:req.user})
// })
app.get("/", (req, res) => {
    if (req.user) {
        // Use 'return' to ensure the function stops here
        return res.status(200).json({ 
            loggedIn: true, 
            user: req.user 
        });
    }
    
    // If no user, send this and stop
    return res.status(200).json({ 
        loggedIn: false 
    });
});

//Login Start
app.get('/auth/google',
    passport.authenticate('google',{scope:['profile','email']})
)

//callback url in case you get error
// app.get('/auth/google/callback',
//    // console.log("Error"),
//     passport.authenticate('google',{failureRedirect:'/'}),
//     function(req,res){
//         //successful authentication >> redirect to dashboard page
//         res.redirect('http://localhost:5173/dashboard')
//     }
// )
const jwt = require("jsonwebtoken");

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    try {
      const user = req.user;

      //  Generate JWT
      const token = jwt.sign(
        {
          id: user._id,
          role: "student", // force student
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );

      //  Redirect to frontend OAuth handler
      res.redirect(
        `http://localhost:5173/oauth-success?token=${token}&role=student`
      );
    } catch (err) {
      console.error("Google OAuth error:", err);
      res.redirect("http://localhost:5173/signin");
    }
  }
);


app.listen(Port,()=>{
    console.log(`Server started at Port no.- ${Port}`)
})

