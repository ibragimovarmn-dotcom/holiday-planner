import express from 'express';
import { showHome, showAbout } from '../controllers/holidayController.js';

const router = express.Router();

router.get('/', showHome);
router.get('/about', showAbout);

export default router;