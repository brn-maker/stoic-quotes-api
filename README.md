# Stoic Quotes API

AI-Powered Stoic Quote Generator using DeepSeek

## Overview
This project provides a RESTful API that generates unique, AI-powered stoic quotes, meditations, and wisdom in the style of famous stoic philosophers. Powered by DeepSeek AI, the API can generate personalized quotes based on themes, situations, or challenges, making it ideal for apps, websites, or personal use.

## Features
- Generate random or themed stoic quotes
- Get daily stoic meditations
- Request custom quotes for specific situations or moods
- Retrieve lists of stoic themes and philosophers
- Batch quote generation (PRO/ULTRA tiers)
- RapidAPI integration with tiered access

## Endpoints
| Method | Endpoint                  | Description                                      |
|--------|---------------------------|--------------------------------------------------|
| GET    | `/api/quote/generate`     | Generate a stoic quote (theme, philosopher, length) |
| POST   | `/api/quote/custom`       | Generate a custom quote for your situation        |
| GET    | `/api/quote/daily`        | Get daily stoic meditation                        |
| GET    | `/api/quote/adversity`    | Get quote for overcoming adversity                |
| GET    | `/api/themes`             | Get available stoic themes                        |
| GET    | `/api/philosophers`       | Get stoic philosophers                            |
| POST   | `/api/quote/batch`        | Generate multiple quotes (PRO/ULTRA only)         |
| GET    | `/health`                 | Health check                                      |

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/stoic-quotes-api.git
cd stoic-quotes-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
PORT=3000
```

### 4. Start the server
```bash
npm start
```

The API will be available at `http://localhost:3000/` by default.

## Example Usage

**Generate a random quote:**
```bash
curl http://localhost:3000/api/quote/generate
```

**Generate a themed quote:**
```bash
curl "http://localhost:3000/api/quote/generate?theme=courage&length=short"
```

**Generate a custom quote:**
```bash
curl -X POST http://localhost:3000/api/quote/custom \
	-H "Content-Type: application/json" \
	-d '{"situation":"dealing with a difficult decision"}'
```

**Get daily meditation:**
```bash
curl http://localhost:3000/api/quote/daily
```

## Deployment
- For production, ensure your `start` script in `package.json` uses `node index.js` or `node server.js` as appropriate.
- Compatible with platforms like Render, Heroku, and Vercel.

## Pricing (RapidAPI)
- **BASIC (Free):** 50 AI-generated quotes/month
- **PRO ($19.99/mo):** 1,000 quotes/month + custom quotes + batch endpoint
- **ULTRA ($99.99/mo):** 10,000 quotes/month + priority processing

## Why Use This API?
- Each quote is unique and personalized
- AI understands context and situation
- Infinite variations, not static quotes
- High value for apps, websites, and personal growth

## License
MIT

## Author
[Your Name](https://github.com/your-username)

## Documentation
See full API docs at: https://rapidapi.com/your-username/api/stoic-quotes-ai
# stoic-quotes-api
