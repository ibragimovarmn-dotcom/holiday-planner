import 'dotenv/config';
import express from 'express';
import holidayRoutes from './routes/holidayRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', holidayRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});