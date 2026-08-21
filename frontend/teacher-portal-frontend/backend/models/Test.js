import mongoose from 'mongoose';
const testSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  grade: { type: String, enum: ['10th', '12th'], required: true },
  board: { type: String, enum: ['10th', '12th'] },
  subject: { type: String, required: true },
  subjects: [{ type: String }],
  topics: [{ type: String }],
  chapters: [{ type: String }],
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  questions: [{ type: { type: String, enum: ['MCQ'], default: 'MCQ' }, questionText: { type: String, required: true }, options: [{ type: String, required: true }], correctIndex: { type: Number, required: true }, topicTag: String, difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] } }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export default mongoose.model('Test', testSchema);
