// middleware/validate.js
// Input-validation middleware. Runs BEFORE the controller,
// so controllers only receive clean, checked values in req.validated.

// Create an error that the central error handler will show to the user
const createValidationError = (message) => {
  const error = new Error(message);
  error.status = 400;          // 400 Bad Request
  error.userMessage = message; // safe text to show on the error page
  return error;
};

// Checks the country code: from the URL path (/upcoming/KZ) or query (?country=KZ)
export const validateCountry = (req, res, next) => {
  const raw = req.params.country ?? req.query.country ?? '';
  const country = String(raw).trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    // Pass the error to the error-handling middleware
    return next(createValidationError('Please select a valid country (2-letter code, e.g. KZ).'));
  }

  // Save the clean value for the controller
  req.validated = { ...req.validated, country };
  next();
};

// Checks the year: from the URL path (/long-weekends/KZ/2026) or query (?year=2026)
export const validateYear = (req, res, next) => {
  const year = Number(req.params.year ?? req.query.year);

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return next(createValidationError('Please enter a year between 2000 and 2100.'));
  }

  req.validated = { ...req.validated, year };
  next();
};