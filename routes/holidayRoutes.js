import express from 'express';
import {
  showHome,
  showAbout,
  showHolidays,
  showUpcoming,
  showLongWeekends
} from '../controllers/holidayController.js';

const router = express.Router();

router.get('/', showHome);
router.get('/holidays', showHolidays);                        
router.get('/upcoming/:country', showUpcoming);               
router.get('/long-weekends/:country/:year', showLongWeekends);
router.get('/about', showAbout);

export default router;