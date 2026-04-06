import mongoose from 'mongoose';

const classroomAnalyticsSchema = new mongoose.Schema(
  {
    classroomCode: { type: String, required: true, index: true },
    department: { type: String, index: true },
    college: { type: String, index: true },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    date: { type: Date, required: true },
    metrics: {
      totalStudyHours: { type: Number, default: 0 },
      averageStudyHours: { type: Number, default: 0 },
      totalQuizAttempts: { type: Number, default: 0 },
      averageQuizScore: { type: Number, default: 0 },
      highestQuizScore: { type: Number, default: 0 },
      averageResumeScore: { type: Number, default: 0 },
      highestResumeScore: { type: Number, default: 0 },
      totalInterviewSessions: { type: Number, default: 0 },
      activeStudents: { type: Number, default: 0 },
      totalStudents: { type: Number, default: 0 },
      attendancePercentage: { type: Number, default: 0 },
      assignmentSubmissionRate: { type: Number, default: 0 },
      averageStreak: { type: Number, default: 0 },
    },
    topPerformers: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        studyHours: Number,
        quizAvg: Number,
        resumeScore: Number,
      },
    ],
  },
  { timestamps: true }
);

// Fast lookup for dashboard queries
classroomAnalyticsSchema.index({ classroomCode: 1, period: 1, date: -1 });
classroomAnalyticsSchema.index({ department: 1, period: 1, date: -1 });
classroomAnalyticsSchema.index({ college: 1, period: 1, date: -1 });

export default mongoose.model('ClassroomAnalytics', classroomAnalyticsSchema);
