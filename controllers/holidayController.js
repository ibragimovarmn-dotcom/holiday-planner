import {
  getAvailableCountries,
  getPublicHolidays,
  getCountryInfo
} from '../services/nagerService.js';

const FALLBACK_COUNTRIES = [
  { countryCode: 'KZ', name: 'Kazakhstan' },
  { countryCode: 'DE', name: 'Germany' },
  { countryCode: 'US', name: 'United States' },
  { countryCode: 'TR', name: 'Turkey' },
  { countryCode: 'JP', name: 'Japan' }
];

const loadCountries = async () => {
  try {
    const countries = await getAvailableCountries();
    return countries.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Could not load countries from API:', error.message);
    return FALLBACK_COUNTRIES;
  }
};

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

export const showHome = async (req, res) => {
  await renderHome(res);
};


export const showAbout = (req, res) => {
  res.render('about', { title: 'About' });
};


export const showHolidays = async (req, res) => {
  const country = (req.query.country || '').trim().toUpperCase();
  const year = Number(req.query.year);


  if (!/^[A-Z]{2}$/.test(country)) {
    return renderHome(res, {
      error: 'Please select a valid country.',
      selectedYear: req.query.year
    });
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
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
      year,
      months,
      summary
    });
  } catch (error) {
    
    console.error('API error in showHolidays:', error.message);

    let message = 'The holiday service is unavailable right now. Please try again later.';
    if (error.response && error.response.status === 404) {
      message = 'We could not find holidays for that country code.';
    }

    renderHome(res, { error: message, selectedCountry: country, selectedYear: year });
  }
};

import {
  mergeConsecutiveHolidays,
  addHolidayDetails,
  groupByMonth,
  getSummary
} from '../utils/holidayHelpers.js';