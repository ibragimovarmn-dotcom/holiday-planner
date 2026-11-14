// app.js - entry point of the Holiday Planner application

// Load variables from .env into process.env (must run before we use them)
import 'dotenv/config';
import express from 'express';
import holidayRoutes from './routes/holidayRoutes.js';
import { logger } from './middleware/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Read the port from .env; use 3000 if it's not set
const PORT = process.env.PORT || 3000;

// --- View engine ---
app.set('view engine', 'ejs');

// --- Built-in middleware ---
// Serve static files (CSS, images) from the "public" folder
app.use(express.static('public'));
// Parse form data into req.body
app.use(express.urlencoded({ extended: true }));
// Parse JSON request bodies into req.body
app.use(express.json());

// --- Custom middleware ---
// Placed after express.static, so only page requests are logged (not every CSS file)
app.use(logger);

// --- Routes ---
app.use('/', holidayRoutes);

// --- 404 handler: runs only if no route above matched ---
app.use(notFound);

// --- Central error handler: must be the LAST app.use ---
app.use(errorHandler);

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});