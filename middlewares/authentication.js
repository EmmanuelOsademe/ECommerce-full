const {UnauthenticatedError, UnauthorisedError} = require('../errors');
const {isTokenValid} = require('../utils');

const authenticateUser = (req, res, next) =>{
    /*let token;
    const authHeader = req.headers.authorization;
    if(req.headers.cookie){
        const cookieHeaderToken = req.headers.cookie.split("=")[1];
        token = {"token": cookieHeaderToken};
    }else if(req.cookies.token){
        token = req.cookies.token;
    }else if(authHeader && authHeader.startsWith('Bearer')){
        token = authHeader.split(' ')[1];
    }*/

    const token = req.signedCookies.token;

    if(!token){
        throw new UnauthenticatedError(`Authentication failed`);
    }

    try {
        const {userId, email, name, role} = isTokenValid(token);
        req.user = {userId, email, name, role};
        next();
    } catch (err) {
        throw new UnauthenticatedError(`Authentication failed`);
    }
};

const authorizePermissions = (...roles) =>{
    return (req, res, next) =>{
        //console.log(roles);
        if(!roles.includes(req.user.role)){
            throw new UnauthorisedError(`User not authorized to access this route`);
        }
        next();
    }
};

module.exports = {authenticateUser, authorizePermissions}