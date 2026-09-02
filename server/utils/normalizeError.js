// Errors reach the central handler from two different worlds:
//
//   1. Ours — `throw new ExpressError('Spot not found', 404)`. These already carry the right
//      status code, because we chose it.
//   2. Mongoose's — a failed enum check, a malformed ObjectId in the URL, a unique-index
//      collision. These carry no status code at all, so the handler's `statusCode = 500`
//      default kicked in and reported "server error" for what is plainly a bad request.
//
// This function is the translation layer between the two, so every error leaves the API in the
// same shape regardless of where it came from.
//
// Note this is NOT a replacement for request validation (Joi, Phase 8). It's a safety net that
// catches what slips through to the database layer. Validating up front gives better messages
// and stops bad data earlier; this just makes sure the status code is honest either way.
function normalizeError(err) {
    // Already ours — trust it.
    if (err.statusCode) {
        return { statusCode: err.statusCode, message: err.message };
    }

    // Schema validation: enum, required, min/max. err.errors is keyed by field path, so the
    // client (react-hook-form, later) can attach each message to the input that caused it.
    if (err.name === 'ValidationError') {
        const details = {};
        for (const [path, fieldError] of Object.entries(err.errors)) {
            details[path] = fieldError.message;
        }
        return { statusCode: 400, message: 'Validation failed', details };
    }

    // A value in the URL or query that can't be coerced to the schema's type — most often a
    // malformed ObjectId, e.g. GET /spots/not-a-real-id. Bad request, not server error.
    if (err.name === 'CastError') {
        return { statusCode: 400, message: `Invalid value for '${err.path}'` };
    }

    // passport-local-mongoose throws its own named errors rather than Mongoose ones, and none
    // of them carry a status code. A taken username means the same thing as a duplicate-key
    // collision; a missing field is a plain bad request.
    if (err.name === 'UserExistsError') {
        return { statusCode: 409, message: err.message };
    }
    if (err.name === 'MissingPasswordError' || err.name === 'MissingUsernameError') {
        return { statusCode: 400, message: err.message };
    }
    // 11000 is MongoDB's duplicate-key code: a unique index rejected the write. 409 Conflict —
    // the request was well-formed, it just collides with something already stored.
    if (err.code === 11000) {
        const fields = Object.keys(err.keyPattern ?? {}).join(', ');
        return {
            statusCode: 409,
            message: fields ? `That ${fields} is already taken` : 'That value is already taken',
        };
    }

    // Genuinely unexpected. Don't echo err.message to the client in production — it can leak
    // stack details, driver internals, or convnection strings. It stays isible in dev, where
    // you're the one reading it.
    return {
        statusCode: 500,
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message || 'Something went wrong',
    };
}

module.exports = normalizeError;
