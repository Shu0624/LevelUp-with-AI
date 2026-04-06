import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    title: { type: String, required: true },
    questions: [
      {
        text: { type: String, required: true },
        type: { 
          type: String, 
          enum: ['mcq', 'coding', 'short-answer'], 
          default: 'mcq' 
        },
        options: [
          { text: String, isCorrect: Boolean }
        ],
        correctAnswer: String, // mostly for short-answer
        explanation: String,
        difficulty: { type: Number, min: 1, max: 5 },
        tags: [String]
      }
    ],
    timeLimit: { type: Number, default: 30 }, // in minutes
    randomize: { type: Boolean, default: true },
    antiCheat: {
      disableCopyPaste: { type: Boolean, default: true },
      tabSwitchLimit: { type: Number, default: 3 }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
