import Test from '../models/Test.js';
import Submission from '../models/Submission.js';

export const submitTest = async (req, res) => {
  try {
    const { studentId, testId, answers } = req.body;

    // 1. Basic validation
    if (!studentId || !testId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 2. Fetch the original test (the answer key)
    const originalTest = await Test.findById(testId);
    if (!originalTest) {
      return res.status(404).json({ error: "Test not found." });
    }

    // 3. Grade the submission
    let score = 0;
    
    const gradedAnswers = answers.map((studentAnswer) => {
      // Find the exact question in the original test array
      const matchedQuestion = originalTest.questions.find(
        (q) => q._id.toString() === studentAnswer.questionId
      );

      if (!matchedQuestion) {
        throw new Error(`Question ID ${studentAnswer.questionId} is invalid.`);
      }

      // Compare student's answer with the true answer
      const isCorrect = studentAnswer.selectedOptionIndex === matchedQuestion.correctIndex;
      if (isCorrect) score++;

      // Build the object to save to the database
      return {
        questionId: matchedQuestion._id,
        selectedOptionIndex: studentAnswer.selectedOptionIndex,
        isCorrect: isCorrect,
        topicTag: matchedQuestion.topicTag // We pull this from the original test!
      };
    });

    // 4. Save the graded submission to MongoDB
    const newSubmission = new Submission({
      studentId,
      testId,
      answers: gradedAnswers,
      score,
      totalQuestions: originalTest.questions.length
    });

    await newSubmission.save();

    // 5. Send the result back to the Student Portal
    res.status(201).json({
      message: "Test graded successfully",
      score,
      totalQuestions: originalTest.questions.length,
      submissionId: newSubmission._id
    });

  } catch (error) {
    console.error("Error grading test:", error);
    res.status(500).json({ error: error.message || "Failed to submit test." });
  }
};