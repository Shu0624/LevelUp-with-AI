// =====================================================================
// LevelUp — Analytics Aggregation Script
// Computes and stores ClassroomAnalytics snapshots
// Can be run manually: node scripts/aggregateAnalytics.js --period daily
// Or called from CRON in server.js
// =====================================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Models
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Resume from '../models/Resume.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import InterviewSession from '../models/InterviewSession.js';
import ClassroomAnalytics from '../models/ClassroomAnalytics.js';

// ---- Date range helpers ----
function getDateRange(period) {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  let start = new Date();

  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }

  return { start, end: now };
}

// ---- Main aggregation function (exported for CRON) ----
export async function runAggregation(period = 'daily') {
  console.log(`[Analytics] Starting ${period} aggregation at ${new Date().toISOString()}`);
  const { start, end } = getDateRange(period);

  // 1. Backfill: update any Activity docs missing classroomCode
  const orphanActivities = await Activity.find({
    $or: [
      { classroomCode: { $exists: false } },
      { classroomCode: '' },
      { classroomCode: null },
    ],
  }).select('user').limit(5000);

  if (orphanActivities.length > 0) {
    console.log(`[Analytics] Backfilling ${orphanActivities.length} activities with classroom data...`);
    const userIds = [...new Set(orphanActivities.map(a => a.user.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select('_id classroomCode department college');
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = {
        classroomCode: u.classroomCode || '',
        department: u.department || '',
        college: u.college || '',
      };
    });

    const bulkOps = orphanActivities
      .filter(a => userMap[a.user.toString()])
      .map(a => ({
        updateOne: {
          filter: { _id: a._id },
          update: {
            $set: {
              classroomCode: userMap[a.user.toString()].classroomCode,
              department: userMap[a.user.toString()].department,
              college: userMap[a.user.toString()].college,
            },
          },
        },
      }));

    if (bulkOps.length > 0) {
      await Activity.bulkWrite(bulkOps);
      console.log(`[Analytics] Backfilled ${bulkOps.length} activities`);
    }
  }

  // 2. Get all unique classroomCodes from students
  const classrooms = await User.distinct('classroomCode', {
    role: 'student',
    classroomCode: { $exists: true, $ne: '' },
  });

  console.log(`[Analytics] Processing ${classrooms.length} classrooms...`);

  for (const classroomCode of classrooms) {
    try {
      // Get students in this classroom
      const students = await User.find({
        role: 'student',
        classroomCode,
      }).select('_id department college streak');

      if (students.length === 0) continue;

      const studentIds = students.map(s => s._id);
      const department = students[0].department || '';
      const college = students[0].college || '';

      // ---- Compute metrics ----

      // Study time
      const actAgg = await Activity.aggregate([
        { $match: { user: { $in: studentIds }, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalSeconds: { $sum: '$duration' } } },
      ]);
      const totalStudyHours = parseFloat(((actAgg[0]?.totalSeconds || 0) / 3600).toFixed(1));
      const averageStudyHours = parseFloat((totalStudyHours / students.length).toFixed(1));

      // Active students (at least 1 activity in period)
      const activeCount = await Activity.distinct('user', {
        user: { $in: studentIds },
        date: { $gte: start, $lte: end },
      });

      // Quiz metrics
      const quizAgg = await QuizAttempt.aggregate([
        { $match: { user: { $in: studentIds }, createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$percentage' },
            maxScore: { $max: '$percentage' },
            totalAttempts: { $sum: 1 },
          },
        },
      ]);

      // Resume metrics
      const resumeAgg = await Resume.aggregate([
        { $match: { user: { $in: studentIds }, 'analysis.score': { $gt: 0 } } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$analysis.score' },
            maxScore: { $max: '$analysis.score' },
          },
        },
      ]);

      // Interview sessions
      const interviewCount = await InterviewSession.countDocuments({
        host: { $in: studentIds },
        createdAt: { $gte: start, $lte: end },
      });

      // Attendance
      const attendanceRecords = await Attendance.find({
        classroomCode,
        date: { $gte: start, $lte: end },
      }).lean();

      let attendancePresent = 0;
      let attendanceTotal = 0;
      attendanceRecords.forEach(rec => {
        rec.records.forEach(r => {
          attendanceTotal++;
          if (r.status === 'present') attendancePresent++;
        });
      });
      const attendancePercentage = attendanceTotal > 0
        ? Math.round((attendancePresent / attendanceTotal) * 100)
        : 0;

      // Assignment submission rate
      const assignments = await Assignment.find({
        classroomCode,
        createdAt: { $gte: start, $lte: end },
      }).lean();
      let totalExpected = 0;
      let totalSubmitted = 0;
      assignments.forEach(a => {
        totalExpected += students.length;
        totalSubmitted += (a.submissions || []).length;
      });
      const assignmentSubmissionRate = totalExpected > 0
        ? Math.round((totalSubmitted / totalExpected) * 100)
        : 0;

      // Average streak
      const avgStreak = students.length > 0
        ? parseFloat(
            (students.reduce((sum, s) => sum + (s.streak?.current || 0), 0) / students.length).toFixed(1)
          )
        : 0;

      // Top performers (study hours based)
      const topAgg = await Activity.aggregate([
        { $match: { user: { $in: studentIds }, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$user', totalSeconds: { $sum: '$duration' } } },
        { $sort: { totalSeconds: -1 } },
        { $limit: 5 },
      ]);

      const topQuizAgg = await QuizAttempt.aggregate([
        { $match: { user: { $in: studentIds } } },
        { $group: { _id: '$user', avgScore: { $avg: '$percentage' } } },
      ]);
      const quizMap = {};
      topQuizAgg.forEach(q => { quizMap[q._id.toString()] = Math.round(q.avgScore); });

      const topPerformers = topAgg.map(a => {
        const stu = students.find(s => s._id.toString() === a._id.toString());
        return {
          studentId: a._id,
          name: stu?.name || 'Student',
          studyHours: parseFloat((a.totalSeconds / 3600).toFixed(1)),
          quizAvg: quizMap[a._id.toString()] || 0,
          resumeScore: 0,
        };
      });

      // ---- Upsert analytics record ----
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await ClassroomAnalytics.findOneAndUpdate(
        { classroomCode, period, date: today },
        {
          $set: {
            department,
            college,
            metrics: {
              totalStudyHours,
              averageStudyHours,
              totalQuizAttempts: quizAgg[0]?.totalAttempts || 0,
              averageQuizScore: Math.round(quizAgg[0]?.avgScore || 0),
              highestQuizScore: Math.round(quizAgg[0]?.maxScore || 0),
              averageResumeScore: Math.round(resumeAgg[0]?.avgScore || 0),
              highestResumeScore: Math.round(resumeAgg[0]?.maxScore || 0),
              totalInterviewSessions: interviewCount,
              activeStudents: activeCount.length,
              totalStudents: students.length,
              attendancePercentage,
              assignmentSubmissionRate,
              averageStreak: avgStreak,
            },
            topPerformers,
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`[Analytics] Error processing ${classroomCode}:`, err.message);
    }
  }

  console.log(`[Analytics] ${period} aggregation complete for ${classrooms.length} classrooms`);
  return { processed: classrooms.length, period };
}

// ---- CLI execution ----
const isDirectRun = process.argv[1] && process.argv[1].includes('aggregateAnalytics');
if (isDirectRun) {
  const period = process.argv.includes('--weekly')
    ? 'weekly'
    : process.argv.includes('--monthly')
    ? 'monthly'
    : 'daily';

  const connectDB = (await import('../config/db.js')).default;
  await connectDB();
  await runAggregation(period);
  process.exit(0);
}
