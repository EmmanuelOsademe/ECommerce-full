const CustomAPIError = require('./customAPI');
const {StatusCodes} = require('http-status-codes');

class UnauthorisedError extends CustomAPIError{
    constructor(message){
        super(message);
        this.statusCode = StatusCodes.FORBIDDEN;
    }
};

module.exports = UnauthorisedError;