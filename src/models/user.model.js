import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcrypt'
const userSchema = new Schema(
    {
        avatar:{
            type: {
                url: String,
                localPath: String
            },
            default:{
                url:`https://placehold.co/200x200`,
                localPath:""
            }
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index:true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            required: [true,"Password is required !"]
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        },
        forgetPasswordToken: {
            type: String
        },
        forgotPasswordExpiry: {
            type: Date
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpiry: {
            type: Date
        }
    },
    {timestamps: true}
)

// using next for clarity (check the multiline comments below to see different style of codes )
userSchema.pre("save", async function (next) {
    // If password is not modified, don't re-hash it
    // We exit early here.
    if (!this.isModified("password")) {
        // In Mongoose <5, you must call next() manually
        // If you don't use "return", the code below will still run,
        // which can lead to double-calling next() and errors.
        return next();
    }

    // Hash the password if it was modified
    this.password = await bcrypt.hash(this.password, 10);

    // Call next() to move to the next middleware / save operation
    next();
});

// to verify the input password......
userSchema.methods.verifyPassword = async function(password) {
    result = await bcrypt.compare(password,this.password)  // returns a boolean value 
    return result 
}


// console.log(userSchema)
const User = mongoose.model("User",userSchema)
// console.log(User)
export {User}







/*
// without next .....
// async await style ......
userSchema.pre("save", async function () {
    // Exit early if password wasn't changed
    if (!this.isModified("password")) return;

    // Otherwise, hash the password
    this.password = await bcrypt.hash(this.password, 10);
});

// without next promise style 
const bcrypt = require("bcrypt");

userSchema.pre("save", function () {
    const user = this;

    // Exit early if password wasn't modified
    if (!user.isModified("password")) {
        return Promise.resolve(); // just return a resolved promise
    }

    // Return the hash promise directly
    return bcrypt.hash(user.password, 10)
        .then(hashedPassword => {
            user.password = hashedPassword;
        });
});
*/