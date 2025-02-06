// note-taking-app/server/routes/summary.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { keys } from '../config/keys.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(keys.geminiApiKey);

const languagePrompts = {
  Hindi: {
    summary: "कृपया इस पाठ का सारांश दें और मुख्य बिंदुओं को हाइलाइट करें।",
    keywords: "इस पाठ से महत्वपूर्ण कीवर्ड्स निकालें।"
  },
  Kannada: {
    summary: "ದಯವಿಟ್ಟು ಈ ಪಠ್ಯದ ಸಾರಾಂಶವನ್ನು ನೀಡಿ ಮತ್ತು ಪ್ರಮುಖ ಅಂಶಗಳನ್ನು ಹೈಲೈಟ್ ಮಾಡಿ.",
    keywords: "ಈ ಪಠ್ಯದಿಂದ ಪ್ರಮುಖ ಕೀವರ್ಡ್‌ಗಳನ್ನು ಹೊರತೆಗೆಯಿರಿ."
  }
};

router.post('/generate', async (req, res) => {
  try {
    const { text, targetLength, language } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Enhanced multilingual summarization prompt
    const summaryPrompt = `
      ${language !== 'English' ? languagePrompts[language]?.summary + '\n\n' : ''}
      Please provide a ${targetLength || 'brief'} summary of the following text.
      ${language === 'English' ? 'in English' : `in both ${language} and English`}.
      
      Requirements:
      1. Length: ${targetLength || 'brief'} summary
      2. Main focus: Key ideas and central themes
      3. Style: Clear and concise language
      ${language !== 'English' ? '4. Format: First in ' + language + ', then in English' : ''}
      
      Text to summarize:
      ${text}
    `;

    // Enhanced multilingual keyword extraction prompt
    const keywordPrompt = `
      ${language !== 'English' ? languagePrompts[language]?.keywords + '\n\n' : ''}
      Extract 5-7 of the most important keywords or key phrases from this text.
      
      Requirements:
      1. Format: One keyword/phrase per line
      2. No numbers or bullet points
      3. Include technical terms if present
      ${language !== 'English' ? '4. For each term, provide:\n   - Original ' + language + ' term\n   - English translation in parentheses' : ''}
      
      Text to analyze:
      ${text}
    `;

    const [summaryResult, keywordResult] = await Promise.all([
      model.generateContent(summaryPrompt),
      model.generateContent(keywordPrompt)
    ]);

    const summary = summaryResult.response.text();
    const keywords = keywordResult.response.text()
      .split('\n')
      .map(k => k.trim())
      .filter(k => k && !k.startsWith('-') && !k.match(/^\d/));

    // Log for debugging
    console.log('Generated summary:', summary);
    console.log('Generated keywords:', keywords);

    res.json({ 
      summary, 
      keywords,
      language 
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: error.message 
    });
  }
});

export default router;