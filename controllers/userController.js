const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, NotFoundError, UnauthenticatedError} = require('../errors');
const {createUserToken, attachCookiesToResponse, checkPermission} = require('../utils');

async function updateUser(req, res){
    const {name, email} = req.body;

    if(!(name || email)){
        throw new BadRequestError(`Missing required field(s)`);
    }

    const user = await User.findOne({_id: req.user.userId});

    if(!user){
        throw new NotFoundError(`User not found`);
    };

    if(email) user.email = email;
    if(name) user.name = name;

    await user.save();

    const userToken = createUserToken(user);
    attachCookiesToResponse({res, user: userToken});
    res.status(StatusCodes.OK).json({user: userToken});
};

const updatePassword = async (req, res) =>{
    const {oldPassword, newPassword} = req.body;

    if(!oldPassword || !newPassword){
        throw new BadRequestError(`Missing required fields`);
    }

    const user = await User.findOne({_id: req.user.userId});

    if(!user){
        throw new NotFoundError(`User not found`);
    };

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if(!isPasswordCorrect){
        throw new UnauthenticatedError(`Password is incorrect`);
    }

    user.password = newPassword;

    await user.save();

    const userToken = createUserToken(user);
    attachCookiesToResponse({res, user: userToken});
    res.status(StatusCodes.OK).json({user: userToken});
}

const deleteUser = async (req, res) =>{
    const user = await User.findOne({_id: req.user.userId});
    if(!user){
        throw new NotFoundError(`User not found`);
    }

    if(!(user.role === "admin")){
        await User.findOneAndRemove({_id: req.user.userId});
    }else{
        throw new UnauthenticatedError(`Cannot delete an admin`)
    }

    res.status(StatusCodes.OK).json({msg: `User deleted`});
};

const getAllUsers = async (req, res) =>{
    const users = await User.find({role: "user"});

    if(users.length === 0){
        res.status(StatusCodes.OK).json({msg: `No users at the moment`});
    }else{
        res.status(StatusCodes.OK).json({users, count: users.length});
    }
};

const getSingleUser = async (req, res) =>{
    const requestId = req.params.userId;
    
    if(!requestId){
        throw new BadRequestError(`Please provide user ID`);
    };
    checkPermission(req.user, requestId);

    const user = await User.findOne({_id: requestId});
    if(!user){
        throw new NotFoundError(`User not found`);
    };

    res.status(StatusCodes.OK).json({user});
}

const showUser = (req, res) =>{
    res.status(StatusCodes.OK).json({user: req.user});
}

module.exports = {updateUser, updatePassword, deleteUser, getAllUsers, getSingleUser, showUser};