const COUNTRIES = [
  { countryCode: 'KZ', name: 'Kazakhstan' },
  { countryCode: 'DE', name: 'Germany' },
  { countryCode: 'US', name: 'United States' },
  { countryCode: 'TR', name: 'Turkey' },
  { countryCode: 'JP', name: 'Japan' }
];

export const showHome = (req, res) => {
  const currentYear = new Date().getFullYear();

  res.render('index', {
    title: 'Home',
    countries: COUNTRIES,
    currentYear
  });
};

export const showAbout = (req, res) => {
  res.render('about', { title: 'About' });
};