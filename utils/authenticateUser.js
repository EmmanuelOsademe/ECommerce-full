const jwt = require('jsonwebtoken');
const UnauthorisedError = require('../errors/unauthorised');

const createJWT = ({payload}) =>{
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    return token;
};

const isTokenValid = (token) =>{
    return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = ({res, user}) =>{
    const token = createJWT({payload: user});

    const cookieDuration = Number(process.env.COOKIE_DURATION);

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + cookieDuration),
        secure: process.env.NODE_ENV === "production",
        signed: true
    });
};

const createUserToken = (user) =>{
    return {name: user.name, userId: user._id, email: user.email, role: user.role};
}

const checkPermission = (requestUser, requestUserId) =>{
    if(requestUser.role === "admin") return;
    if(requestUser.userId === requestUserId.toString())return;
    throw new UnauthorisedError(`You are not authorised to access this route`);
}

module.exports = {createJWT, isTokenValid, attachCookiesToResponse, createUserToken, checkPermission};