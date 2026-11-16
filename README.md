# Holiday Planner

Holiday Planner is a web application that helps users plan their days off.
The user chooses a country and a year and sees all public holidays, a countdown
to the next holiday, and long weekends (including which working day to take off
to get a longer break).

Built with **Node.js, Express, Axios and EJS** 

## API used

**Nager.Date Public Holidays API:** https://date.nager.at/Api
Free, no API key required.

Endpoints used:

| Endpoint | Purpose |
|---|---|
| `GET /api/v3/AvailableCountries` | List of countries for the dropdown |
| `GET /api/v3/PublicHolidays/{year}/{countryCode}` | All public holidays in a year |
| `GET /api/v3/CountryInfo/{countryCode}` | Country name for page titles |
| `GET /api/v3/NextPublicHolidays/{countryCode}` | Holidays in the next 365 days |
| `GET /api/v3/LongWeekend/{year}/{countryCode}` | Long weekends and bridge days |

## Features

- Search public holidays by country and year
- Data processing (not raw JSON):
  - multi-day holidays are merged into one entry (e.g. Nauryz, 21–23 March)
  - holidays are grouped by month and sorted by date
  - status for each holiday: past / today / upcoming, with "in N days" countdown
  - summary: number of holidays, days off, holidays on weekends, next holiday
- Upcoming holidays page with a countdown to the nearest holiday
- Long weekends page with bridge-day hints and sorting by date or length
- Server-side input validation (country code and year)
- Friendly error pages for invalid input, unknown pages (404) and API problems
  (not found, timeout, no connection, rate limit, server errors)
- Responsive design for desktop and mobile

## Routes

| Method | Route | Description |
|---|---|---|
| GET | `/` | Home page with the search form |
| GET | `/holidays?country=KZ&year=2026` | Public holidays for a country and year |
| GET | `/upcoming/:country` | Upcoming holidays with countdown |
| GET | `/long-weekends/:country/:year?sort=date\|length` | Long weekends in a year |
| GET | `/about` | About the app and the API |
| — | any other URL | 404 page |

## Installation and running

Requirements: Node.js 18 or newer.

```bash
git clone https://github.com/ibragimovarmn-dotcom/holiday-planner.git
cd holiday-planner
npm install
```

Create a `.env` file from the example:

```bash
# Windows
copy .env.example .env
# macOS / Linux
cp .env.example .env
```

`.env` variables:

```
PORT=3000
API_BASE_URL=https://date.nager.at/api/v3
```

Start the server:

```bash
npm start
```

Open http://localhost:3000

## Project structure

```
holiday-planner/
├── app.js                       # entry point: middleware, routes, error handlers
├── routes/holidayRoutes.js      # URL -> controller mapping
├── controllers/holidayController.js  # request handling logic
├── services/nagerService.js     # all Axios requests to the API
├── utils/holidayHelpers.js      # data processing functions
├── middleware/
│   ├── logger.js                # logs method, URL, status and time
│   ├── validate.js              # validates country code and year
│   ├── setLocals.js             # shared variables for all views
│   └── errorHandler.js          # 404 handler + central error handler
├── views/                       # EJS templates (+ partials/header, footer)
├── public/css/style.css         # styles
├── .env.example
└── README.md
```

## Screenshots

### Home page


### Holidays in Kazakhstan, 2026


### Mobile view


## Known limitations

- Holiday data comes from Nager.Date. Some holidays (for example Kurban Ait
  in Kazakhstan, which moves every year) are not included in the API data.
- Some local holiday names from the API may be incomplete.

## Credits and AI use

- Holiday data: [Nager.Date](https://date.nager.at)
- AI assistance (Claude) was used for explanations, code suggestions and debugging,
  as described in the AI Declaration submitted with this project.
  All code was reviewed, tested and can be explained by the author.