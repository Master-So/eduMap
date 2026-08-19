import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  board: { type: String, enum: ['10th', '12th'], required: true },
  topics: [{ type: String }],
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of 4 options
    correctIndex: { type: Number, required: true },
    topicTag: String,
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Test', testSchema);