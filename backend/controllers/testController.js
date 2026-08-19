import Test from '../models/Test.js';
import { generateTestQuestions } from '../services/geminiService.js';

export const generateTest = async (req, res) => {
  try {
    const { subject, board, topics, teacherId } = req.body;

    // Basic validation
    if (!subject || !board || !topics || topics.length === 0) {
      return res.status(400).json({ error: "Missing required fields: subject, board, or topics." });
    }

    // 1. Ask Gemini to generate the questions
    const questions = await generateTestQuestions(subject, board, topics);

    // 2. Save the generated test to MongoDB
    const newTest = new Test({
      subject,
      board,
      topics,
      questions,
      createdBy: teacherId // Optional for the MVP if you haven't built auth yet
    });

    await newTest.save();

    // 3. Send the saved test (including the auto-generated question IDs) back to the frontend
    res.status(201).json({
      message: "Test generated successfully",
      test: newTest
    });

  } catch (error) {
    console.error("Error generating test:", error);
    res.status(500).json({ error: "Failed to generate AI test. Please try again." });
  }
};