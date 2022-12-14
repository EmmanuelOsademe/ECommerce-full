const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Please provide your username"],
        minLength: 3, 
        maxLength: 50
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        require: [true, "Please provide your email address"],
        validate: {
            validator: validator.isEmail,
            message: "Invalid email address. Please provide a valid email address"
        }
    },
    password: {
        type: String,
        required: [true, "Please provide your password"],
        minLength: 8
    },
    role: {
        type: String,
        enum: ["user", 'admin'],
        default: "user"
    }
}, {timestamps: true});

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function(userPassword){
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
};

module.exports = mongoose.model("User", UserSchema);