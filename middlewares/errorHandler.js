const {StatusCodes} = require('http-status-codes');

const errorHandler = (err, req, res, next) =>{
    console.log(err);
    
    // Default/Custom Error
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong. Try again'
    };

    if(err.name === 'ValidationError'){
        customError.statusCode = 400,
        customError.msg = Object.values(err.errors).map((items) => items.message).join(', ');
    };

    if(err.code && err.code === 11000){
        customError.statusCode = 400;
        customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)}, field.`
    }

    if(err.name === "CastError"){
        customError.statusCode = 404;
        customError.msg = `No item found with id: ${err.value}`
    }

    if(err.code && err.code === 404){
        customError.statusCode = 404;
        customError.msg = `${req.path} does not exist`;
    }

    return res.status(customError.statusCode).json(customError.msg);
}

module.exports = errorHandler;