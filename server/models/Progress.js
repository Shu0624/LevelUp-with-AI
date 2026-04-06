import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true
    },
    modules: [
      {
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
        moduleName: String,
        completedLessons: [String], // IDs of lessons completed
        quizScores: [Number],
        lastAccessed: Date
      }
    ],
    overallProgress: {
      type: Number,
      default: 0
    },
    weeklyActivity: [
      {
        weekStartDate: Date,
        hoursSpent: Number,
        testsCompleted: Number
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);
