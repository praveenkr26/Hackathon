const logger = require('../utils/logger');

let genAI = null;
let model = null;

// Initialize Gemini AI if API key is available
const initGemini = () => {
  if (process.env.GEMINI_API_KEY && !genAI) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      logger.info('✅ Gemini AI initialized');
    } catch (err) {
      logger.warn('Gemini AI initialization failed:', err.message);
    }
  }
};

initGemini();

/**
 * POST /api/ai/intent
 * Classify user's intent from their text message
 */
const classifyIntent = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!model) {
      // Fallback: keyword-based classification
      const intent = fallbackIntentClassification(message);
      return res.json({ success: true, data: intent, mode: 'fallback' });
    }

    const prompt = `
      Classify the following user message into one of these intents:
      - find_scheme: User wants to find welfare schemes
      - check_eligibility: User wants to check if they are eligible
      - get_documents: User wants to know required documents
      - apply_scheme: User wants to apply for a scheme
      - general_info: General information request
      
      User message: "${message}"
      
      Respond in JSON format only:
      {"intent": "intent_name", "confidence": 0.95, "entities": {"category": "education", "age": 25}}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const intent = JSON.parse(jsonMatch[0]);
      return res.json({ success: true, data: intent, mode: 'ai' });
    }

    throw new Error('Invalid AI response format');
  } catch (error) {
    logger.error('classifyIntent error:', error);
    const intent = fallbackIntentClassification(req.body.message || '');
    res.json({ success: true, data: intent, mode: 'fallback' });
  }
};

/**
 * POST /api/ai/profile
 * Extract user eligibility profile from natural language text
 */
const extractProfile = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    if (!model) {
      const parsed = fallbackProfileExtraction(text);
      return res.json({
        success: true,
        data: parsed,
        mode: 'fallback'
      });
    }

    const prompt = `
      Extract the following user profile information from this text:
      - age (number)
      - gender (male/female/other)
      - income (annual income in INR)
      - caste (general/sc/st/obc)
      - state (Indian state name)
      - occupation (e.g., farmer, student, unemployed)
      - disability (true/false)
      
      Text: "${text}"
      
      Respond in JSON format only, include only fields that are mentioned:
      {"age": 25, "gender": "male", "income": 60000}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const profile = JSON.parse(jsonMatch[0]);
      return res.json({ success: true, data: profile, mode: 'ai' });
    }

    throw new Error('Invalid response format');
  } catch (error) {
    logger.error('extractProfile error:', error);
    const parsed = fallbackProfileExtraction(req.body.text || '');
    res.json({ success: true, data: parsed, mode: 'fallback' });
  }
};

/**
 * POST /api/ai/ocr
 * Process document text (placeholder for OCR integration)
 */
const processDocument = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        message: 'OCR processing is available in the premium plan',
        extractedFields: null
      }
    });
  } catch (error) {
    logger.error('processDocument error:', error);
    res.status(500).json({ success: false, error: 'Document processing failed' });
  }
};

// ─── Fallback Helpers ────────────────────────────────────────────────────────

/**
 * Regex-based bilingual profile extractor (fallback for offline mode)
 */
const fallbackProfileExtraction = (text) => {
  const lower = text.toLowerCase();
  const profile = {};

  // 1. Age extraction
  const ageMatch = lower.match(/(?:age\s*(?:is)?\s*|साल(?:\s*की)?\s*उम्र\s*|वर्ष(?:\s*की)?\s*आयु\s*|उम्र\s*|आयु\s*)?(\d{1,2})\s*(?:years?|yrs?|yr|years?\s*old|साल|वर्ष)/i) || 
                   lower.match(/(\d{1,2})\s*(?:साल|वर्ष|years?|yrs?)/i);
  if (ageMatch) {
    profile.age = parseInt(ageMatch[1]);
  } else {
    const numbers = lower.match(/\b\d{1,2}\b/g);
    if (numbers && numbers.length > 0) {
      const parsedAge = parseInt(numbers[0]);
      if (parsedAge > 5 && parsedAge < 90) {
        profile.age = parsedAge;
      }
    }
  }

  // 2. Gender extraction
  if (lower.includes('female') || lower.includes('woman') || lower.includes('women') || 
      lower.includes('महिला') || lower.includes('औरत') || lower.includes('लड़की') || lower.includes('स्त्री')) {
    profile.gender = 'female';
  } else if (lower.includes('male') || lower.includes('man') || lower.includes('men') || 
             lower.includes('पुरुष') || lower.includes('आदमी') || lower.includes('लड़का')) {
    profile.gender = 'male';
  } else if (lower.includes('other') || lower.includes('transgender') || lower.includes('अन्य')) {
    profile.gender = 'other';
  }

  // 3. Caste extraction
  if (lower.includes('sc') || lower.includes('अनुसूचित जाति') || lower.includes('एस सी')) {
    profile.caste = 'sc';
  } else if (lower.includes('st') || lower.includes('अनुसूचित जनजाति') || lower.includes('एस टी')) {
    profile.caste = 'st';
  } else if (lower.includes('obc') || lower.includes('अन्य पिछड़ा वर्ग') || lower.includes('ओबीसी') || lower.includes('पिछड़ा')) {
    profile.caste = 'obc';
  } else if (lower.includes('general') || lower.includes('सामान्य') || lower.includes('जनरल') || lower.includes('अनारक्षित')) {
    profile.caste = 'general';
  }

  // 4. State extraction
  const states = [
    { en: 'andhra pradesh', hi: 'आंध्र प्रदेश' },
    { en: 'arunachal pradesh', hi: 'अरुणाचल प्रदेश' },
    { en: 'assam', hi: 'असम' },
    { en: 'bihar', hi: 'बिहार' },
    { en: 'chhattisgarh', hi: 'छत्तीसगढ़' },
    { en: 'goa', hi: 'गोवा' },
    { en: 'gujarat', hi: 'गुजरात' },
    { en: 'haryana', hi: 'हरियाणा' },
    { en: 'himachal pradesh', hi: 'हिमाचल प्रदेश' },
    { en: 'jharkhand', hi: 'झारखंड' },
    { en: 'karnataka', hi: 'कर्नाटक' },
    { en: 'kerala', hi: 'केरल' },
    { en: 'madhya pradesh', hi: 'मध्य प्रदेश' },
    { en: 'maharashtra', hi: 'महाराष्ट्र' },
    { en: 'manipur', hi: 'मणिपुर' },
    { en: 'meghalaya', hi: 'मेघालय' },
    { en: 'mizoram', hi: 'मिजोरम' },
    { en: 'nagaland', hi: 'नागालैंड' },
    { en: 'odisha', hi: 'ओडिशा' },
    { en: 'punjab', hi: 'पंजाब' },
    { en: 'rajasthan', hi: 'राजस्थान' },
    { en: 'sikkim', hi: 'सिक्किम' },
    { en: 'tamil nadu', hi: 'तमिलनाडु' },
    { en: 'telangana', hi: 'तेलंगाना' },
    { en: 'tripura', hi: 'त्रिपुरा' },
    { en: 'uttar pradesh', hi: 'उत्तर प्रदेश' },
    { en: 'uttarakhand', hi: 'उत्तराखंड' },
    { en: 'west bengal', hi: 'पश्चिम बंगाल' },
    { en: 'delhi', hi: 'दिल्ली' },
    { en: 'jammu & kashmir', hi: 'जम्मू और कश्मीर' },
    { en: 'ladakh', hi: 'लद्दाख' },
    { en: 'chandigarh', hi: 'चंडीगढ़' },
    { en: 'puducherry', hi: 'पुडुचेरी' }
  ];

  for (const s of states) {
    if (lower.includes(s.en) || lower.includes(s.hi)) {
      profile.state = s.en.replace(/\b\w/g, c => c.toUpperCase());
      break;
    }
  }

  if (!profile.state) {
    if (lower.includes('up') || lower.includes('यू पी') || lower.includes('यूपी')) profile.state = 'Uttar Pradesh';
    else if (lower.includes('mp') || lower.includes('मध्य प्रदेश')) profile.state = 'Madhya Pradesh';
    else if (lower.includes('ap')) profile.state = 'Andhra Pradesh';
    else if (lower.includes('wb')) profile.state = 'West Bengal';
  }

  // 5. Occupation extraction
  if (lower.includes('farmer') || lower.includes('kisan') || lower.includes('किसान') || lower.includes('खेती') || lower.includes('कृषक')) {
    profile.occupation = 'farmer';
  } else if (lower.includes('student') || lower.includes('scholarship') || lower.includes('छात्र') || lower.includes('विद्यार्थी') || lower.includes('पढ़ाई') || lower.includes('स्कूल') || lower.includes('कॉलेज')) {
    profile.occupation = 'student';
  } else if (lower.includes('unemployed') || lower.includes('jobless') || lower.includes('बेरोजगार') || lower.includes('काम नहीं')) {
    profile.occupation = 'unemployed';
  } else if (lower.includes('self-employed') || lower.includes('business') || lower.includes('shopkeeper') || lower.includes('खुद का काम') || lower.includes('दुकान') || lower.includes('व्यापार')) {
    profile.occupation = 'self-employed';
  } else if (lower.includes('employed') || lower.includes('job') || lower.includes('नौकरी') || lower.includes('रोजगार')) {
    profile.occupation = 'employed';
  }

  // 6. Disability
  if (lower.includes('disabled') || lower.includes('disability') || lower.includes('handicap') || 
      lower.includes('विकलांग') || lower.includes('दिव्यांग') || lower.includes('अक्षम')) {
    profile.disability = true;
  }

  // 7. Income extraction
  const incomeNumbers = lower.match(/\b\d{4,8}\b/g);
  if (incomeNumbers && incomeNumbers.length > 0) {
    profile.income = parseInt(incomeNumbers[0]);
  } else {
    const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lakh|l|लाख)/i);
    const thousandMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k|हजार)/i);
    if (lakhMatch) {
      profile.income = Math.round(parseFloat(lakhMatch[1]) * 100000);
    } else if (thousandMatch) {
      profile.income = Math.round(parseFloat(thousandMatch[1]) * 1000);
    } else {
      if (lower.includes('poor') || lower.includes('low income') || lower.includes('गरीब') || lower.includes('कम आय') || lower.includes('पिछड़ा')) {
        profile.income = 80000;
      }
    }
  }

  return profile;
};

const fallbackIntentClassification = (message) => {
  const lower = message.toLowerCase();
  let intent = 'general_info';
  const entities = {};

  if (lower.includes('find') || lower.includes('show') || lower.includes('list') || lower.includes('scheme')) {
    intent = 'find_scheme';
  } else if (lower.includes('eligible') || lower.includes('qualify') || lower.includes('eligible')) {
    intent = 'check_eligibility';
  } else if (lower.includes('document') || lower.includes('paper') || lower.includes('required')) {
    intent = 'get_documents';
  } else if (lower.includes('apply') || lower.includes('register') || lower.includes('enroll')) {
    intent = 'apply_scheme';
  }

  if (lower.includes('farmer') || lower.includes('kisan')) entities.category = 'agriculture';
  if (lower.includes('student') || lower.includes('scholarship')) entities.category = 'education';
  if (lower.includes('health') || lower.includes('medical')) entities.category = 'health';
  if (lower.includes('house') || lower.includes('housing')) entities.category = 'housing';

  const ageMatch = lower.match(/(\d+)\s*year/);
  if (ageMatch) entities.age = parseInt(ageMatch[1]);

  return { intent, confidence: 0.7, entities };
};

module.exports = { classifyIntent, extractProfile, processDocument };
