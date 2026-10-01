class ExpressError extends Error {
    // `details` is optional, per-field context keyed by field path (see middleware.validate).
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}

module.exports = ExpressError;
