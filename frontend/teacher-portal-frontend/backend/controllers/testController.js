import Test from '../models/Test.js';
import User from '../models/user.js';
import { SYLLABUS } from '../config/syllabus.js';
import { generateTestQuestions } from '../services/geminiService.js';

export const generateTest = async (req, res) => {
  try {
    const { grade, subjects, chapters, questionCount = 10 } = req.body;
    const subjectList = Array.isArray(subjects) ? subjects : subjects ? [subjects] : [];
    const chapterList = Array.isArray(chapters) ? chapters : chapters ? [chapters] : [];
    if (!grade || !SYLLABUS[grade] || !subjectList.length || !chapterList.length) return res.status(400).json({ error: 'Grade, subjects, and chapters are required.' });
    const validSubjects = Object.keys(SYLLABUS[grade]);
    if (subjectList.some((subject) => !validSubjects.includes(subject))) return res.status(400).json({ error: 'One or more subjects are not valid for this grade.' });
    const validChapters = subjectList.flatMap((subject) => SYLLABUS[grade][subject]);
    if (chapterList.some((chapter) => !validChapters.includes(chapter))) return res.status(400).json({ error: 'One or more chapters are not valid for the selected grade and subjects.' });
    const questions = await generateTestQuestions(subjectList, grade, chapterList, Number(questionCount));
    
    let teacherId = req.user?._id || req.user?.id;
    if (!teacherId) {
      let defaultTeacher = await User.findOne({ role: 'teacher' });
      if (!defaultTeacher) {
        defaultTeacher = await User.create({
          name: 'Teacher',
          email: 'teacher@edumap.test',
          password: 'default-password-123',
          role: 'teacher'
        });
      }
      teacherId = defaultTeacher._id;
    }

    const test = await Test.create({ title: `${grade} ${subjectList[0]} Quiz`, grade, board: grade, subject: subjectList[0], subjects: subjectList, topics: chapterList, chapters: chapterList, questions, createdBy: teacherId });
    res.status(201).json({ message: 'Test generated successfully', quiz: test, test });
  } catch (error) { console.error('Error generating test:', error); res.status(500).json({ error: error.message || 'Failed to generate AI test.' }); }
};

