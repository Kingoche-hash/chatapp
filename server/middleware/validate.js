export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  if (source === 'body') {
    req.body = result.data;
  } else {
    // Express 5 does not allow overwriting req.query, so cleaned values go in req.valid.
    req.valid = { ...req.valid, [source]: result.data };
  }

  next();
};