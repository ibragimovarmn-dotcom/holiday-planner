// middleware/errorHandler.js
// 1) notFound: runs when no route matched the URL
// 2) errorHandler: the central place where ALL errors end up

// 404 handler for unknown routes
export const notFound = (req, res) => {
  res.status(404).render('404', { title: 'Page not found', url: req.originalUrl });
};

// Centralized error-handling middleware.
// Express recognizes it as an error handler because it has FOUR parameters.
export const errorHandler = (err, req, res, next) => {
  // If a response has already started, let Express handle it
  if (res.headersSent) {
    return next(err);
  }

  // --- Technical details: only in the console, never shown to the user ---
  console.error(`[ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
  if (err.response) {
    console.error('  API responded with:', err.response.status, err.response.data);
  } else if (!err.userMessage && !err.request) {
    console.error(err.stack); // unexpected bug in our own code
  }

  // --- Choose a status code and a friendly message ---
  let status = 500;
  let message = 'Something went wrong on our side. Please try again later.';

  if (err.userMessage) {
    // Validation error created in middleware/validate.js
    status = err.status || 400;
    message = err.userMessage;
  } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    // Axios timeout (we set timeout: 5000 in the service)
    status = 504;
    message = 'The holiday service is taking too long to respond. Please try again in a moment.';
  } else if (err.response) {
    // The API answered with an error status code
    const apiStatus = err.response.status;
    if (apiStatus === 404) {
      status = 404;
      message = 'We could not find holidays for that country or year.';
    } else if (apiStatus === 400) {
      status = 400;
      message = 'The holiday service did not accept this request. Please check the country and year.';
    } else if (apiStatus === 401 || apiStatus === 403) {
      status = 502;
      message = 'The app could not access the holiday service (access denied).';
    } else if (apiStatus === 429) {
      status = 429;
      message = 'Too many requests to the holiday service. Please wait a minute and try again.';
    } else if (apiStatus >= 500) {
      status = 502;
      message = 'The holiday service is having problems right now. Please try again later.';
    }
  } else if (err.request) {
    // The request was sent but no answer came back (no internet, wrong address, DNS error)
    status = 503;
    message = 'Could not connect to the holiday service. Please check your internet connection.';
  }

  res.status(status).render('error', { title: 'Error', status, message });
};