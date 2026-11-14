// controllers/holidayController.js
// Controllers contain the logic for each route: get data, process it, render a view.
// Input is already validated by middleware (req.validated),
// and errors are passed to the central error handler with next(error).

import {
  getAvailableCountries,
  getPublicHolidays,
  getCountryInfo,
  getNextPublicHolidays,
  getLongWeekends
} from '../services/nagerService.js';
import {
  mergeConsecutiveHolidays,
  addHolidayDetails,
  groupByMonth,
  getSummary,
  processLongWeekends,
  getLongWeekendSummary
} from '../utils/holidayHelpers.js';

// Backup list, used only if the API is unavailable,
// so the home page still works even when the API is down.
const FALLBACK_COUNTRIES = [
  { countryCode: 'KZ', name: 'Kazakhstan' },
  { countryCode: 'DE', name: 'Germany' },
  { countryCode: 'US', name: 'United States' },
  { countryCode: 'TR', name: 'Turkey' },
  { countryCode: 'JP', name: 'Japan' }
];

// Load countries from the API, sorted A-Z; fall back to the backup list on error
const loadCountries = async () => {
  try {
    const countries = await getAvailableCountries();
    return countries.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Could not load countries from API:', error.message);
    return FALLBACK_COUNTRIES;
  }
};

// GET / - home page with the search form
export const showHome = async (req, res, next) => {
  try {
    const countries = await loadCountries();
    const currentYear = new Date().getFullYear();
    res.render('index', {
      title: 'Home',
      countries,
      currentYear,
      selectedCountry: '',
      selectedYear: currentYear,
      error: null
    });
  } catch (error) {
    next(error);
  }
};

// GET /about - information about the app and the API
export const showAbout = (req, res) => {
  res.render('about', { title: 'About' });
};

// GET /holidays?country=KZ&year=2026 - list of public holidays
export const showHolidays = async (req, res, next) => {
  // Clean values prepared by the validation middleware
  const { country, year } = req.validated;

  try {
    // Two API requests at the same time (they don't depend on each other)
    const [holidays, countryInfo] = await Promise.all([
      getPublicHolidays(year, country),
      getCountryInfo(country)
    ]);

    // Process the raw API data step by step
    const merged = mergeConsecutiveHolidays(holidays); // join multi-day holidays
    const detailed = addHolidayDetails(merged);        // status, countdown, weekend days
    const months = groupByMonth(detailed);             // group for display
    const summary = getSummary(detailed);              // totals + next holiday

    res.render('holidays', {
      title: `Holidays in ${countryInfo.commonName}`,
      countryName: countryInfo.commonName,
      countryCode: country,
      year,
      months,
      summary
    });
  } catch (error) {
    next(error); // handled in middleware/errorHandler.js
  }
};

// GET /upcoming/:country - holidays in the next 12 months with a countdown
export const showUpcoming = async (req, res, next) => {
  const { country } = req.validated;

  try {
    const [holidays, countryInfo] = await Promise.all([
      getNextPublicHolidays(country),
      getCountryInfo(country)
    ]);

    // Reuse the same processing functions as the /holidays page
    const upcoming = addHolidayDetails(mergeConsecutiveHolidays(holidays));
    const totalDays = upcoming.reduce((sum, h) => sum + h.days, 0);

    res.render('upcoming', {
      title: `Upcoming holidays in ${countryInfo.commonName}`,
      countryName: countryInfo.commonName,
      countryCode: country,
      holidays: upcoming,
      totalDays
    });
  } catch (error) {
    next(error);
  }
};

// GET /long-weekends/:country/:year?sort=date|length - long weekends in a year
export const showLongWeekends = async (req, res, next) => {
  const { country, year } = req.validated;
  // Whitelist: only 'length' is accepted, anything else becomes 'date'
  const sortBy = req.query.sort === 'length' ? 'length' : 'date';

  try {
    const [weekends, countryInfo] = await Promise.all([
      getLongWeekends(year, country),
      getCountryInfo(country)
    ]);

    const processed = processLongWeekends(weekends, sortBy);
    const summary = getLongWeekendSummary(processed);

    res.render('longWeekends', {
      title: `Long weekends in ${countryInfo.commonName}`,
      countryName: countryInfo.commonName,
      countryCode: country,
      year,
      weekends: processed,
      summary,
      sortBy
    });
  } catch (error) {
    next(error);
  }
};