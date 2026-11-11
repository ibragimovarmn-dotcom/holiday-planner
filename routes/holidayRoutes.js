import express from 'express';
import { showHome, showAbout, showHolidays } from '../controllers/holidayController.js';

const router = express.Router();

router.get('/', showHome);
router.get('/holidays', showHolidays);
router.get('/about', showAbout);

export default router;