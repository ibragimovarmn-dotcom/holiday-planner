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

// Validation rules shared by all routes (will move into middleware on day 6)
const isValidCountry = (code) => /^[A-Z]{2}$/.test(code);
const isValidYear = (year) => Number.isInteger(year) && year >= 2000 && year <= 2100;

// Turn an Axios error into a friendly message for the user
const getApiErrorMessage = (error) => {
  if (error.response && error.response.status === 404) {
    return 'We could not find data for that country code.';
  }
  return 'The holiday service is unavailable right now. Please try again later.';
};

// Helper: load countries from the API, sorted A-Z; fall back to the backup list on error
const loadCountries = async () => {
  try {
    const countries = await getAvailableCountries();
    return countries.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Could not load countries from API:', error.message);
    return FALLBACK_COUNTRIES;
  }
};

// Helper: render the home page (used for the normal page and for showing errors)
const renderHome = async (res, { error = null, selectedCountry = '', selectedYear } = {}) => {
  const countries = await loadCountries();
  res.render('index', {
    title: 'Home',
    countries,
    currentYear: new Date().getFullYear(),
    selectedCountry,
    selectedYear: selectedYear || new Date().getFullYear(),
    error
  });
};

// GET / - home page with the search form
export const showHome = async (req, res) => {
  await renderHome(res);
};

// GET /about - information about the app and the API
export const showAbout = (req, res) => {
  res.render('about', { title: 'About' });
};

// GET /holidays?country=KZ&year=2026 - list of public holidays
export const showHolidays = async (req, res) => {
  // 1. Read and clean user input from the query string
  const country = (req.query.country || '').trim().toUpperCase();
  const year = Number(req.query.year);

  // 2. Validate input BEFORE calling the API
  if (!isValidCountry(country)) {
    return renderHome(res, {
      error: 'Please select a valid country.',
      selectedYear: req.query.year
    });
  }
  if (!isValidYear(year)) {
    return renderHome(res, {
      error: 'Please enter a year between 2000 and 2100.',
      selectedCountry: country
    });
  }

  try {
    // 3. Two API requests at the same time (they don't depend on each other)
    const [holidays, countryInfo] = await Promise.all([
      getPublicHolidays(year, country),
      getCountryInfo(country)
    ]);

    // 4. Process the raw API data step by step
    const merged = mergeConsecutiveHolidays(holidays); // join multi-day holidays
    const detailed = addHolidayDetails(merged);        // status, countdown, weekend days
    const months = groupByMonth(detailed);             // group for display
    const summary = getSummary(detailed);              // totals + next holiday

    // 5. Render the results page
    res.render('holidays', {
      title: `Holidays in ${countryInfo.commonName}`,
      countryName: countryInfo.commonName,
      countryCode: country,
      year,
      months,
      summary
    });
  } catch (error) {
    // Log technical details for the developer, show a friendly message to the user
    console.error('API error in showHolidays:', error.message);
    renderHome(res, { error: getApiErrorMessage(error), selectedCountry: country, selectedYear: year });
  }
};

// GET /upcoming/:country - holidays in the next 12 months with a countdown
export const showUpcoming = async (req, res) => {
  // req.params contains values from the URL path, e.g. /upcoming/KZ -> { country: 'KZ' }
  const country = req.params.country.toUpperCase();

  if (!isValidCountry(country)) {
    return renderHome(res, { error: 'Please select a valid country.' });
  }

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
    console.error('API error in showUpcoming:', error.message);
    renderHome(res, { error: getApiErrorMessage(error), selectedCountry: country });
  }
};

// GET /long-weekends/:country/:year?sort=date|length - long weekends in a year
export const showLongWeekends = async (req, res) => {
  const country = req.params.country.toUpperCase();
  const year = Number(req.params.year);
  // Whitelist: only 'length' is accepted, anything else becomes 'date'
  const sortBy = req.query.sort === 'length' ? 'length' : 'date';

  if (!isValidCountry(country)) {
    return renderHome(res, { error: 'Please select a valid country.' });
  }
  if (!isValidYear(year)) {
    return renderHome(res, {
      error: 'Please enter a year between 2000 and 2100.',
      selectedCountry: country
    });
  }

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
    console.error('API error in showLongWeekends:', error.message);
    renderHome(res, { error: getApiErrorMessage(error), selectedCountry: country, selectedYear: year });
  }
};