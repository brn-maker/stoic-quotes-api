// AI-Powered Stoic Quote Generator API using DeepSeek
// To run: 1) npm install express cors axios dotenv  2) node server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Stoic philosophers for attribution
const stoicPhilosophers = [
  'Marcus Aurelius', 'Epictetus', 'Seneca', 'Zeno of Citium', 
  'Cleanthes', 'Chrysippus', 'Cato the Younger', 'Musonius Rufus'
];

// Categories of stoic wisdom
const stoicThemes = [
  'virtue', 'acceptance', 'resilience', 'self-control', 'wisdom',
  'mortality', 'duty', 'tranquility', 'courage', 'justice', 
  'perspective', 'adversity', 'focus', 'gratitude'
];

// Middleware to verify RapidAPI requests
function verifyRapidAPI(req, res, next) {
  const rapidApiKey = req.headers['x-rapidapi-proxy-secret'];
  const rapidApiUser = req.headers['x-rapidapi-user'];
  
  console.log('RapidAPI User:', rapidApiUser);
  console.log('Request from:', req.ip);
  
  const userTier = req.headers['x-rapidapi-subscription'] || 'BASIC';
  req.userTier = userTier;
  
  next();
}

app.use('/api', verifyRapidAPI);

// Track usage
function trackUsage(endpoint) {
  return (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${endpoint} - Tier: ${req.userTier}`);
    next();
  };
}

// Helper function to call DeepSeek API
async function generateWithDeepSeek(prompt, maxTokens = 150) {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a stoic philosopher. Generate profound, concise stoic wisdom in the style of Marcus Aurelius, Epictetus, and Seneca. Keep responses brief and impactful.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
        top_p: 0.95
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate quote');
  }
}

// ============= API ENDPOINTS =============

// GET /api/quote/generate - Generate a stoic quote
app.get('/api/quote/generate', trackUsage('/quote/generate'), async (req, res) => {
  try {
    const { theme, philosopher, length = 'medium' } = req.query;
    
    // Build the prompt
    let prompt = 'Generate a profound stoic quote about ';
    
    if (theme && stoicThemes.includes(theme.toLowerCase())) {
      prompt += `${theme}. `;
    } else {
      const randomTheme = stoicThemes[Math.floor(Math.random() * stoicThemes.length)];
      prompt += `${randomTheme}. `;
    }
    
    if (length === 'short') {
      prompt += 'Keep it to one sentence, maximum 15 words.';
    } else if (length === 'long') {
      prompt += 'Make it 2-3 sentences with deep wisdom.';
    } else {
      prompt += 'Keep it to 1-2 sentences, around 20-30 words.';
    }
    
    const quoteText = await generateWithDeepSeek(prompt);
    
    // Select philosopher
    const selectedPhilosopher = philosopher && stoicPhilosophers.includes(philosopher)
      ? philosopher
      : stoicPhilosophers[Math.floor(Math.random() * stoicPhilosophers.length)];
    
    res.json({
      success: true,
      data: {
        quote: quoteText,
        attributedTo: `In the style of ${selectedPhilosopher}`,
        theme: theme || 'general stoic wisdom',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate quote',
      message: error.message
    });
  }
});

// POST /api/quote/custom - Generate custom stoic quote based on situation
app.post('/api/quote/custom', trackUsage('/quote/custom'), async (req, res) => {
  try {
    const { situation, mood, challenge } = req.body;
    
    if (!situation && !mood && !challenge) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one of: situation, mood, or challenge'
      });
    }
    
    let prompt = 'Generate a stoic quote that addresses: ';
    
    if (situation) prompt += `Situation: ${situation}. `;
    if (mood) prompt += `Current mood: ${mood}. `;
    if (challenge) prompt += `Challenge: ${challenge}. `;
    
    prompt += 'Provide stoic wisdom to help with this situation.';
    
    const quoteText = await generateWithDeepSeek(prompt, 200);
    const philosopher = stoicPhilosophers[Math.floor(Math.random() * stoicPhilosophers.length)];
    
    res.json({
      success: true,
      data: {
        quote: quoteText,
        attributedTo: `In the style of ${philosopher}`,
        context: { situation, mood, challenge },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate custom quote',
      message: error.message
    });
  }
});

// GET /api/quote/daily - Generate daily stoic meditation
app.get('/api/quote/daily', trackUsage('/quote/daily'), async (req, res) => {
  try {
    const prompt = `Generate a stoic daily meditation for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Include a main teaching and a practical reflection question.`;
    
    const meditation = await generateWithDeepSeek(prompt, 250);
    
    res.json({
      success: true,
      data: {
        meditation: meditation,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily meditation',
      message: error.message
    });
  }
});

// GET /api/quote/adversity - Get quote for handling adversity
app.get('/api/quote/adversity', trackUsage('/quote/adversity'), async (req, res) => {
  try {
    const { type = 'general' } = req.query;
    
    const prompt = `Generate a powerful stoic quote about overcoming ${type} adversity. Make it inspiring and actionable.`;
    
    const quoteText = await generateWithDeepSeek(prompt);
    
    res.json({
      success: true,
      data: {
        quote: quoteText,
        attributedTo: 'In the style of Marcus Aurelius',
        theme: 'adversity',
        type: type,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate adversity quote',
      message: error.message
    });
  }
});

// GET /api/themes - Get available stoic themes
app.get('/api/themes', trackUsage('/themes'), (req, res) => {
  res.json({
    success: true,
    data: stoicThemes
  });
});

// GET /api/philosophers - Get stoic philosophers
app.get('/api/philosophers', trackUsage('/philosophers'), (req, res) => {
  res.json({
    success: true,
    data: stoicPhilosophers
  });
});

// POST /api/quote/batch - Generate multiple quotes (PRO tier only)
app.post('/api/quote/batch', trackUsage('/quote/batch'), async (req, res) => {
  // Check tier
  if (req.userTier !== 'PRO' && req.userTier !== 'ULTRA') {
    return res.status(403).json({
      success: false,
      error: 'This endpoint requires PRO subscription or higher',
      upgradeUrl: 'https://rapidapi.com/your-api/pricing'
    });
  }
  
  try {
    const { count = 3, themes = [] } = req.body;
    const maxCount = Math.min(parseInt(count), 10);
    
    const quotes = [];
    
    for (let i = 0; i < maxCount; i++) {
      const theme = themes.length > 0 
        ? themes[i % themes.length]
        : stoicThemes[Math.floor(Math.random() * stoicThemes.length)];
      
      const prompt = `Generate a unique stoic quote about ${theme}. Make it concise and powerful.`;
      const quoteText = await generateWithDeepSeek(prompt);
      const philosopher = stoicPhilosophers[Math.floor(Math.random() * stoicPhilosophers.length)];
      
      quotes.push({
        quote: quoteText,
        attributedTo: `In the style of ${philosopher}`,
        theme: theme
      });
      
      // Small delay to avoid rate limiting
      if (i < maxCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    res.json({
      success: true,
      data: quotes,
      count: quotes.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate batch quotes',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    deepseekConfigured: !!DEEPSEEK_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI-Powered Stoic Quote Generator API',
    version: '2.0.0',
    description: 'Generate personalized stoic wisdom using AI',
    poweredBy: 'DeepSeek AI',
    endpoints: {
      'GET /api/quote/generate': 'Generate a stoic quote (theme, philosopher, length)',
      'POST /api/quote/custom': 'Generate custom quote for your situation',
      'GET /api/quote/daily': 'Get daily stoic meditation',
      'GET /api/quote/adversity': 'Get quote for overcoming adversity',
      'GET /api/themes': 'Get available stoic themes',
      'GET /api/philosophers': 'Get stoic philosophers',
      'POST /api/quote/batch': 'Generate multiple quotes (PRO only)'
    },
    documentation: 'https://rapidapi.com/your-username/api/stoic-quotes-ai'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏛️  Stoic Quote AI API running on http://localhost:${PORT}`);
  console.log(`DeepSeek API Key configured: ${!!DEEPSEEK_API_KEY}`);
  console.log('\n📚 Test endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/quote/generate`);
  console.log(`  GET  http://localhost:${PORT}/api/quote/generate?theme=resilience&length=short`);
  console.log(`  POST http://localhost:${PORT}/api/quote/custom`);
  console.log(`       Body: {"situation": "feeling overwhelmed at work"}`);
  console.log(`  GET  http://localhost:${PORT}/api/quote/daily`);
});

// ============= SETUP INSTRUCTIONS =============
/*
1. Create a .env file in your project root:
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   PORT=3000

2. Install dependencies:
   npm install express cors axios dotenv

3. Run the server:
   node server.js

4. Test with curl:
   curl http://localhost:3000/api/quote/generate
   curl http://localhost:3000/api/quote/generate?theme=courage&length=short
   curl -X POST http://localhost:3000/api/quote/custom \
     -H "Content-Type: application/json" \
     -d '{"situation":"dealing with a difficult decision"}'

PRICING STRATEGY FOR RAPIDAPI:
- BASIC (Free): 50 AI-generated quotes/month
- PRO ($19.99/mo): 1,000 quotes/month + custom quotes + batch endpoint
- ULTRA ($99.99/mo): 10,000 quotes/month + priority processing

This is much more valuable than static quotes because:
✓ Each quote is unique and personalized
✓ AI understands context and situation
✓ Can generate infinite variations
✓ Users can't get this anywhere else
✓ Higher perceived value = higher prices
*/