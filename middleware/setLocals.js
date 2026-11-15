// middleware/setLocals.js
// Custom middleware: puts values into res.locals.
// Everything in res.locals is automatically available in ALL EJS views,
// so we don't have to pass these values from every controller.

export const setLocals = (req, res, next) => {
  res.locals.currentPath = req.path;                 // used to highlight the active menu link
  res.locals.currentYear = new Date().getFullYear(); // used in the footer
  next();
};