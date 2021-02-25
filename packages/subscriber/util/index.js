const notFound = (req, res) => {
  const err = `{"error": "Can't find ${req.originalUrl} on this server"}`;
  res.contentType('application/json')
  res.status(404).end(err);
}

const serverError = (
  err,
  req,
  res,
  _
) => {
  const errorResponse = {
    error: {
      message: "Something went wrong.",
      [process.env.NODE_ENV === 'development' && 'stack']: err.stack,
      [process.env.NODE_ENV === 'development' && 'originalErrorMessage']: err.message,
      [process.env.NODE_ENV === 'development' && 'originalErrorObject']: err.toString(),

    }
  }
  res.contentType('application/json');

  res.status(500).end(JSON.stringify(errorResponse));
};

const jsonResponseHelper = (_, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.contentType('application/json');
  next();
}

module.exports = {
  notFound, serverError, jsonResponseHelper
}
