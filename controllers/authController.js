const User = require('../models/User');
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors');
const {createUserToken, attachCookiesToResponse} = require('../utils');
const {StatusCodes} = require('http-status-codes');

// Register
const register = async (req, res) =>{
    if(!req.body){
        throw new BadRequestError(`Missing required field(s)`);
    };

    const {name, email, password} = req.body;

    if(!(name && email && password)){
        throw new BadRequestError(`Missing required field(s)`);
    }

    const emailAlreadyExist = await User.findOne({email});

    if(emailAlreadyExist){
        throw new BadRequestError(`${email} already exists`);
    };

    const role = (await User.countDocuments({})) === 0 ? "admin" : "user";

    const user = await User.create({name, email, password, role});
    const userToken = createUserToken(user);
    attachCookiesToResponse({res, user: userToken});
    res.status(StatusCodes.CREATED).json({user: userToken});
}

// Login
const login = async (req, res) =>{
    const {email, password} = req.body;

    if(!email || !password){
        throw new BadRequestError(`Missing required fields`);
    };

    const user = await User.findOne({email: email});

    if(!user){
        throw new NotFoundError(`User not found`);
    };

    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect){
        throw new UnauthenticatedError(`Password is incorrect`);
    }

    const userToken = createUserToken(user);
    attachCookiesToResponse({res, user: userToken});
    res.status(StatusCodes.OK).json({user: userToken});
};

// Logout
async function logout(req, res){
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 1000)
    });
    res.status(StatusCodes.OK).json({msg: `Logout successful`});
};

module.exports = {register, login, logout}