const statusCodes = require("http-status-codes");

module.exports = {
	pageNotFoundError: (req, res) => {
		let errorCode = statusCodes.NOT_FOUND;
		res.status(errorCode);
		res.send(`Error ${errorCode} | Sorry, that webpage does not exist.`)
	},

	internalServerError: (error, req, res, next) => {
		let errorCode = statusCodes.INTERNAL_SERVER_ERROR;
		console.log(error);
		res.status(errorCode);
		res.send(`Error ${errorCode} | Sorry, there was an internal error.`)
	}
}