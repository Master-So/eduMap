import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  subject: { type: String, default: 'Unassigned subject' },
  chapters: [{ type: String }],
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    topicTag: { type: String, default: '' },
  }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
