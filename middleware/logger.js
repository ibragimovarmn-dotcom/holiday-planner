// middleware/logger.js
// Custom middleware: logs every request with method, URL, status code, time and duration.

export const logger = (req, res, next) => {
  const start = Date.now();

  // 'finish' fires when the response has been sent,
  // so at this moment we already know the status code
  res.on('finish', () => {
    const time = new Date().toLocaleTimeString('en-GB');
    const duration = Date.now() - start;
    console.log(`[${time}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration} ms)`);
  });

  // Pass control to the next middleware / route
  next();
};
