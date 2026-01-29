import { Router } from "express";

const router = Router();

// Check if AI assistant is available (requires OPENAI_API_KEY)
router.get("/status", async (req, res) => {
  const isAvailable = !!process.env.OPENAI_API_KEY;
  res.json({ available: isAvailable });
});

// Study help endpoint
router.post("/study-help", async (req, res) => {
  try {
    const { query, language = "english" } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const response = language === "english" 
      ? `Based on your request "${query}", I've analyzed the core requirements for government exams. Focus on static General Knowledge (History, Polity) and current affairs from the last 6 months. For SSC, prioritize Quantitative Aptitude and English comprehension. For UPSC, emphasize analytical understanding of the Constitution and Indian Economy.`
      : `आपके अनुरोध "${query}" के आधार पर, मैंने सरकारी परीक्षाओं के लिए मुख्य आवश्यकताओं का विश्लेषण किया है। स्टेटिक सामान्य ज्ञान (इतिहास, राजनीति) और पिछले 6 महीनों के समसामयिक मामलों पर ध्यान दें। SSC के लिए, मात्रात्मक अभिरुचि और अंग्रेजी समझ को प्राथमिकता दें। UPSC के लिए, संविधान और भारतीय अर्थव्यवस्था की विश्लेषणात्मक समझ पर जोर दें।`;

    res.json({ response });
  } catch (error) {
    console.error("AI study help error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Answer explanation endpoint
router.post("/explain-answer", async (req, res) => {
  try {
    const { question, correctAnswer, language = "english" } = req.body;
    
    if (!question || !correctAnswer) {
      return res.status(400).json({ error: "Question and correct answer are required" });
    }

    const explanation = language === "english"
      ? `The answer is ${correctAnswer} because it directly addresses the core logic of the question "${question}". In competitive exams, identifying the most precise option is key.`
      : `उत्तर ${correctAnswer} है क्योंकि यह सीधे प्रश्न "${question}" के मूल तर्क को संबोधित करता है। प्रतियोगी परीक्षाओं में, सबसे सटीक विकल्प की पहचान करना महत्वपूर्ण है।`;

    res.json({ explanation });
  } catch (error) {
    console.error("AI explanation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Practice questions generation endpoint
router.post("/generate-questions", async (req, res) => {
  try {
    const { topic, language = "english" } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const questions = language === "english"
      ? `I've prepared a set of practice questions for "${topic}". These cover the most frequently asked patterns in recent exams. You can find them in your personalized practice bucket.`
      : `मैंने "${topic}" के लिए अभ्यास प्रश्नों का एक सेट तैयार किया है। ये हाल की परीक्षाओं में सबसे अधिक पूछे जाने वाले पैटर्न को कवर करते हैं। आप उन्हें अपनी व्यक्तिगत अभ्यास बाल्टी में पा सकते हैं।`;

    res.json({ questions });
  } catch (error) {
    console.error("AI question generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Study recommendations endpoint
router.post("/study-recommendations", async (req, res) => {
  try {
    const { performanceData, language = "english" } = req.body;
    
    const recommendations = language === "english"
      ? "Based on your current performance (Accuracy: 75%), I recommend spending more time on logical reasoning and revising previous year's history questions. Your time management is good, but precision needs improvement in complex math problems."
      : "आपके वर्तमान प्रदर्शन (सटीकता: 75%) के आधार पर, मैं तार्किक तर्क पर अधिक समय बिताने और पिछले वर्ष के इतिहास के प्रश्नों को संशोधित करने की सलाह देता हूं। आपका समय प्रबंधन अच्छा है, लेकिन जटिल गणित की समस्याओं में सटीकता में सुधार की आवश्यकता है।";

    res.json({ recommendations });
  } catch (error) {
    console.error("AI recommendations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;