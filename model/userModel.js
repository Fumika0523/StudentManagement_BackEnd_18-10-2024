const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, trim: true },
    //  structured name
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    //  keep for display + backward compatibility
    name: { type: String, trim: true }, 
    username: { type: String, required: true, unique: true, lowercase: true,
     trim: true
     },
    email: {
      type: String,
      required: true,
      unique: true,        
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: false },

    phoneNumber: { type: String, required: false, trim: true },

    gender: { type: String, default: "Rather not say" },
    birthdate: { type: Date, required: false },
    isActive: { type: Boolean, default: true, index: true },
  disabledAt: { type: Date, default: null },
  disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    role: {
      type: String,
      enum: [
        "admin",
        "user",
        "manager",
        "supportTeam",
        "testingTeam",
        "guest",
        "student",
        "staff",
      ],
      required: false,
      default: "user", 
    },
  },
  { timestamps: true }
);

//  auto-fill name if missing
userSchema.pre("save", function (next) {
  if (!this.name) {
    const fn = (this.firstName || "").trim();
    const ln = (this.lastName || "").trim();
    const full = `${fn} ${ln}`.trim();
    if (full) this.name = full;
  }
  next();
});

//  create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { sparse: true }); // only if you want unique username later

userSchema.methods.generateAuthToken = async function () {
  return jwt.sign(
    { _id: this.id, role: this.role },
    process.env.JWT_SECRET_KEY
  );
};

userSchema.virtual("studentRel", {
  ref: "Student",
  localField: "_id",
  foreignField: "owner",
});

module.exports = mongoose.model("User", userSchema);
