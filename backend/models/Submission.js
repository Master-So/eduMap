import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Test', 
    required: true 
  },
  // Array of answers the student submitted
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links to the specific question inside the Test document
    selectedOptionIndex: { type: Number, required: true }, // E.g., 2 (which corresponds to option C)
    isCorrect: { type: Boolean, required: true },
    topicTag: { type: String, required: true } // Copying this here makes the analytics aggregation much faster
  }],
  score: { 
    type: Number, 
    required: true 
  },
  totalQuestions: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);