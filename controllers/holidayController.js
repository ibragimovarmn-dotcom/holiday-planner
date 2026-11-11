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
    const [holidays, countryInfo] = await Promise.all([
      getPublicHolidays(year, country),
      getCountryInfo(country)
    ]);

  
    const processed = holidays
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(holiday => ({
        ...holiday,
        
        formattedDate: new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'long'
        })
      }));

    res.render('holidays', {
      title: `Holidays in ${countryInfo.commonName}`,
      countryName: countryInfo.commonName,
      year,
      holidays: processed
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