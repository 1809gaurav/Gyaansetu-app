import { Router } from "express";

const router = Router();

// Check if AI assistant is available (requires OPENAI_API_KEY)
router.get("/status", async (req, res) => {
  const isAvailable = !!process.env.OPENAI_API_KEY;
  res.json({ available: isAvailable });
});

// Study help endpoint
router.post("/study-help", async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ 
      error: "AI Assistant not configured. Please add OPENAI_API_KEY to environment variables." 
    });
  }

  try {
    const { query, language = "english", context = "exam_preparation" } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // For now, return a placeholder response since no API key is available
    const response = language === "english" 
      ? `I understand you're asking about: "${query}". However, I need an OpenAI API key to provide detailed assistance. Please contact your administrator to set up the OPENAI_API_KEY environment variable.`
      : `मैं समझता हूं कि आप इसके बारे में पूछ रहे हैं: "${query}"। हालांकि, विस्तृत सहायता प्रदान करने के लिए मुझे OpenAI API key की आवश्यकता है। OPENAI_API_KEY environment variable सेट करने के लिए कृपया अपने व्यवस्थापक से संपर्क करें।`;

    res.json({ response });
  } catch (error) {
    console.error("AI study help error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Answer explanation endpoint
router.post("/explain-answer", async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ 
      error: "AI explanations require API key configuration." 
    });
  }

  try {
    const { question, correctAnswer, userAnswer, options, language = "english" } = req.body;
    
    if (!question || !correctAnswer) {
      return res.status(400).json({ error: "Question and correct answer are required" });
    }

    // Placeholder response
    const explanation = language === "english"
      ? `For the question "${question}", the correct answer is "${correctAnswer}". AI explanations would be available with proper API key setup.`
      : `प्रश्न "${question}" के लिए, सही उत्तर "${correctAnswer}" है। उचित API key सेटअप के साथ AI व्याख्या उपलब्ध होगी।`;

    res.json({ explanation });
  } catch (error) {
    console.error("AI explanation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Practice questions generation endpoint
router.post("/generate-questions", async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ 
      error: "Question generation requires API key setup." 
    });
  }

  try {
    const { topic, count = 5, difficulty = "medium", language = "english" } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    // Placeholder response
    const questions = language === "english"
      ? `I would generate ${count} ${difficulty} questions about "${topic}", but I need an OpenAI API key to create practice questions. Please configure OPENAI_API_KEY.`
      : `मैं "${topic}" के बारे में ${count} ${difficulty} प्रश्न तैयार करूंगा, लेकिन अभ्यास प्रश्न बनाने के लिए मुझे OpenAI API key की आवश्यकता है। कृपया OPENAI_API_KEY कॉन्फ़िगर करें।`;

    res.json({ questions });
  } catch (error) {
    console.error("AI question generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Study recommendations endpoint
router.post("/study-recommendations", async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ 
      error: "Study recommendations require AI functionality." 
    });
  }

  try {
    const { performanceData, language = "english" } = req.body;
    
    if (!performanceData) {
      return res.status(400).json({ error: "Performance data is required" });
    }

    // Placeholder response
    const recommendations = language === "english"
      ? "I would analyze your performance and provide personalized study recommendations, but this requires OpenAI API key configuration."
      : "मैं आपके प्रदर्शन का विश्लेषण करके व्यक्तिगत अध्ययन सुझाव दूंगा, लेकिन इसके लिए OpenAI API key कॉन्फ़िगरेशन आवश्यक है।";

    res.json({ recommendations });
  } catch (error) {
    console.error("AI recommendations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;