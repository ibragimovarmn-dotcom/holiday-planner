import axios from 'axios';


const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'https://date.nager.at/api/v3',
  timeout: 5000 
});

export const getAvailableCountries = async () => {
  const response = await api.get('/AvailableCountries');
  return response.data;
};


export const getPublicHolidays = async (year, countryCode) => {
  const response = await api.get(`/PublicHolidays/${year}/${countryCode}`);
  return response.data;
};


export const getCountryInfo = async (countryCode) => {
  const response = await api.get(`/CountryInfo/${countryCode}`);
  return response.data;
};