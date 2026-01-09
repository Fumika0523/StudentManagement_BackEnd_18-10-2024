const passport = require("passport")
const User = require('./model/userModel')
const GoogleStrategy =require('passport-google-oauth20').Strategy
const Student = require('./model/studentModel')
passport.use(new GoogleStrategy({
   clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},

//profile >> an object that contains the user's Google account information
//e.g
//profile = {
//   id: "109283746512837465",
//   displayName: "Fumika Mikami",
//   emails: [
//     { value: "fumika@gmail.com", verified: true }
//   ],
//   photos: [
//     { value: "https://lh3.googleusercontent.com/..." }
//   ]
// }

//profile.id >> Google unique userID
//profile.displayName >>> User full name
// profile.emails[0].value >> user email
//Google LOgin -> Passport gets Google profile -> Find user in DB -> Create if not exists -> Tell Passport 'done'(cb) -> User logged in.
async(accessToken, refreshToken, profile,cb)=>{
try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // 1. Create the User first
            user = await User.create({
                googleId: profile?.id,
                name: profile?.displayName,
                email: profile?.emails?.[0]?.value,
                role: "student", // Default role
            });

            // 2. IMPORTANT: Create the Student record linked to this User
            // Since Google doesn't provide birthdate/phone, we use placeholders or null
            await Student.create({
                _id: user._id,              // Use the same ID as the User
                studentName: user.name,
                username: user.email.split('@')[0], // Create a username from email
                email: user.email,
                password: "google-auth-user", // Placeholder since they use Google
                phoneNumber: 0,               // Placeholder
                birthdate: new Date(),        // Placeholder
                gender: "Rather not say",
                role: user.role
            });
        }
        return cb(null, user);

}catch(e){
       console.log("Passport Strategy Error:", e);
        // Pass the error to the callback 'cb', do NOT use res.send
        return cb(e, null);
    }
}))


//serializeUser: determines what data of the user object should be stored in the session(cookie).
//Typically we only store the User ID, not the full object
passport.serializeUser(function (user,cb){
    //takes the user object after login
    //user is the full user object from DB
    //cb is the callback passport uses to save session information
    return cb(null,user._id) //save only user._id in session
    //null >> indicates no error
    //
})

//deserializeUser: called on every request with a session cookie. 
// Passport reads the ID from the session(from the cookie (from serializeUser)), then this function fetches the full user object from the DB
passport.deserializeUser(async(id, cb)=>{
    try{
    // Find the full user object using the ID stored in session
    const user = await User.findById(id)
    // Pass the user object to Passport
    cb(null,user)
    }catch(e){
        //If DB lookup fails, pass the error
        cb(e,null)
    }
})