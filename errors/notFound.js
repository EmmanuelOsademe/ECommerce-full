const CustomAPIError = require('./customAPI');
const {StatusCodes} = require('http-status-codes');

class BadRequestError extends CustomAPIError{
    constructor(message){
        super(message);
        this.statusCode = StatusCodes.NOT_FOUND;
    }
};

module.exports = BadRequestError;