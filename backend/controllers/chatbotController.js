const chatbotController = {
  query: async (req, res) => {
    try {
      const { message } = req.body;
      const query = message.toLowerCase();

      // Campus Knowledge Base
      const knowledgeBase = [
        {
          keywords: ['admission', 'fees', 'apply', 'join'],
          answer: "Admissions for the 2026 academic year are now OPEN! You can apply through the 'Academic Vault' or visit the main administrative block. General fees range from 45,000 to 1.2 Lakh per semester depending on the course."
        },
        {
          keywords: ['attendance', 'percentage', 'criteria', '75'],
          answer: "Our campus follows a strict 75% attendance rule for exam eligibility. You can track your real-time percentage in the 'AttendanceTracker' on your dashboard. Defaulters will be barred from final labs."
        },
        {
          keywords: ['hostel', 'room', 'accommodation', 'stay'],
          answer: "We offer premium on-campus housing with high-speed Wi-Fi and 24/7 security. Room allotments are handled at the Warden's Office in Block C. Current availability is 15% for international students and 5% for domestic students."
        },
        {
          keywords: ['mess', 'food', 'canteen', 'lunch', 'dinner'],
          answer: "The Mess serves nutritious meals daily. Breakfast: 8:00 AM - 9:30 AM, Lunch: 12:30 PM - 2:00 PM, Dinner: 8:00 PM - 9:30 PM. Check the 'Mess Menu' on your portal for today's special!"
        },
        {
          keywords: ['library', 'books', 'reading', 'study'],
          answer: "The Central Library is open 24/7 during exam season. Normally, it operates from 8:00 AM to 10:00 PM. You can also access digital PDFs and notes in the 'Notes Sharing' section of Nova."
        },
        {
          keywords: ['emergency', 'help', 'security', 'medical'],
          answer: "For immediate assistance, dial 108 or contact Campus Security at +91-9988776655. The campus medical clinic is located near the Sports Complex."
        },
        {
          keywords: ['event', 'club', 'celebration', 'fest'],
          answer: "Check out the 'Event Horizon' section! We have 'NovaFest 2.0' coming up next month. You can register for clubs like Coding, Dance, and Robotics directly there."
        }
      ];

      // Match logic
      let foundAnswer = null;
      for (const entry of knowledgeBase) {
        if (entry.keywords.some(keyword => query.includes(keyword))) {
          foundAnswer = entry.answer;
          break;
        }
      }

      // Default Fallback
      if (!foundAnswer) {
        foundAnswer = "I'm Nova, your Campus Assistant! While I specialize in college queries (Admissions, Labs, Mess, Events), I can try to help. Could you be more specific about your campus quest?";
      }

      res.json({ reply: foundAnswer });

    } catch (error) {
      console.error('Chatbot Error:', error);
      res.status(500).json({ message: "My neural circuits are slightly overloaded. Try again in a second!" });
    }
  }
};

module.exports = chatbotController;
