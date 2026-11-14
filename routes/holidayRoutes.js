// routes/holidayRoutes.js
// Routes connect URLs to controller functions.
// Validation middleware runs first, in the order listed.

import express from 'express';
import {
  showHome,
  showAbout,
  showHolidays,
  showUpcoming,
  showLongWeekends
} from '../controllers/holidayController.js';
import { validateCountry, validateYear } from '../middleware/validate.js';

const router = express.Router();

router.get('/', showHome);
router.get('/holidays', validateCountry, validateYear, showHolidays);                       // ?country=KZ&year=2026
router.get('/upcoming/:country', validateCountry, showUpcoming);                            // /upcoming/KZ
router.get('/long-weekends/:country/:year', validateCountry, validateYear, showLongWeekends); // /long-weekends/KZ/2026
router.get('/about', showAbout);

export default router;