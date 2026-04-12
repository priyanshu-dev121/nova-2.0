const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CAMPUS_CONTEXT = `
You are Nova, the official smart AI assistant for "Campus Nova". 
Your objective is to provide elite, intelligent, and human-like assistance to students and faculty.

Core Persona:
- Professional yet friendly, extremely intelligent, and witty.
- You behave like a highly advanced AI (similar to ChatGPT) but specialized for this campus.
- You speak with confidence and clarity.

Official Knowledge Base:
1. Admissions: Open for 2026. Academic Vault for applications. Fees: 45k - 1.2L per semester.
2. Attendance: 75% rule is strict. Track via AttendanceTracker on dashboard.
3. Hostel: Premium housing, Wi-Fi, 24/7 security. Warden Office in Block C.
4. Mess: Breakfast (8-9:30), Lunch (12:30-2), Dinner (8-9:30). Specials on the portal.
5. Library: 24/7 during exams, else 8 AM - 10 PM. Digital PDFs in Notes Sharing.
6. Emergency: Dial 108 or Campus Security +91-9988776655. Clinic near Sports Complex.
7. Events: NovaFest 2.0 coming next month. Register in Event Horizon.
8. Departments: CSE (AI/ML focus), Mechanical, Biotechnology, MBA, Design.
9. Navigation: Smart map available in the Dashboard.

Operational Instructions:
- Use Markdown for responses (bolding, bullet points, headers).
- Maintain conversation context perfectly.
- If asked about non-campus topics, answer intelligently but relate it back to academic success or campus life if possible.
- Never mention "basic fallback" or "manual matching" to the user.
- Encourage users to explore specific sections of the Nova platform like the 'Academic Vault' or 'Event Horizon'.
`;

const chatbotController = {
  query: async (req, res) => {
    const { message, history } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
        return basicFallback(message, res);
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: CAMPUS_CONTEXT
      });

      // Start chat with history
      const chat = model.startChat({
        history: history || [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      let text = response.text();

      res.json({ reply: text });

    } catch (error) {
      console.error('Chatbot Error Details:', error);
      // Fallback if Gemini fails for some reason
      return basicFallback(message, res);
    }
  }
};

const basicFallback = (message, res) => {
    const query = message.toLowerCase();
    const knowledgeBase = [
        { keywords: ['admission', 'fees'], answer: "Admissions for 2026 are OPEN! Fees range from 45k-1.2L per semester. Check the 'Academic Vault' for details." },
        { keywords: ['attendance'], answer: "Our 75% attendance rule is mandatory. You can track your progress in the 'AttendanceTracker'." },
        { keywords: ['hostel'], answer: "We offer premium housing with 24/7 security. All allotments are handled in Block C." },
        { keywords: ['mess', 'food'], answer: "The mess is active! Timings: 8-9:30 AM (B), 12:30-2 PM (L), 8-9:30 PM (D)." },
        { keywords: ['library'], answer: "The Central Library is your study hub. Open 8 AM - 10 PM, or 24/7 during exams." }
    ];

    let foundAnswer = knowledgeBase.find(entry => entry.keywords.some(k => query.includes(k)));
    
    res.json({ 
        reply: foundAnswer ? foundAnswer.answer : "I'm Nova, your Campus Assistant! I'm here to help with Admissions, Labs, Mess, and any campus-related quest you're on." 
    });
};

module.exports = chatbotController;
