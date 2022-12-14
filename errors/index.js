const BadRequestError = require('./badRequest');
const CustomAPIError = require('./customAPI');
const NotFoundError = require('./notFound');
const UnauthenticatedError = require('./unauthenticated');
const UnauthorisedError = require('./unauthorised');

module.exports = {BadRequestError, CustomAPIError, NotFoundError, UnauthorisedError, UnauthenticatedError};