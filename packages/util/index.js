export const notFound = (req, res) => {
  const err = `{"error": "Can't find ${req.originalUrl} on this server"}`;
  res.contentType('application/json')
  res.status(404).end(err);
}

export const serverError = (
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
