// =====================================================================
// LevelUp Analytics Query Engine
// Local heuristic NLP that converts natural language questions 
// into MongoDB aggregation results + chart configurations
// =====================================================================

import mongoose from 'mongoose';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Resume from '../models/Resume.js';
import Attendance from '../models/Attendance.js';
import ClassroomAnalytics from '../models/ClassroomAnalytics.js';

// ---- Query pattern definitions ----
const PATTERNS = [
  {
    id: 'study_time',
    regex: /(?:show|get|what(?:'s| is)?|how much)\s+(?:the\s+)?(?:total\s+)?study\s*(?:time|hours?)/i,
    handler: handleStudyTime,
    description: 'Study time queries',
  },
  {
    id: 'quiz_scores',
    regex: /(?:show|get|what(?:'s| is)?|how)\s+(?:the\s+)?(?:average|avg|mean)?\s*(?:quiz|test)\s*(?:scores?|results?|performance)/i,
    handler: handleQuizScores,
    description: 'Quiz score queries',
  },
  {
    id: 'resume_scores',
    regex: /(?:show|get|what(?:'s| is)?)\s+(?:the\s+)?(?:average|avg)?\s*resume\s*(?:scores?|quality|analysis)/i,
    handler: handleResumeScores,
    description: 'Resume score queries',
  },
  {
    id: 'top_performers',
    regex: /(?:who|show|list|get)\s+(?:are\s+)?(?:the\s+)?(?:top|best|highest)\s*(?:\d+\s+)?(?:performers?|students?|achievers?)/i,
    handler: handleTopPerformers,
    description: 'Top performer queries',
  },
  {
    id: 'compare',
    regex: /(?:compare|vs|versus|difference|comparison)\s+(?:between\s+)?/i,
    handler: handleCompare,
    description: 'Comparison queries',
  },
  {
    id: 'attendance',
    regex: /(?:show|get|what(?:'s| is)?)\s+(?:the\s+)?attendance/i,
    handler: handleAttendance,
    description: 'Attendance queries',
  },
  {
    id: 'at_risk',
    regex: /(?:at.?risk|struggling|failing|low.?performing|inactive|at risk|behind)/i,
    handler: handleAtRisk,
    description: 'At-risk student queries',
  },
  {
    id: 'trends',
    regex: /(?:show|get|what(?:'s| is)?)\s+(?:the\s+)?(?:trend|progress|growth|change|history)/i,
    handler: handleTrends,
    description: 'Trend queries',
  },
  {
    id: 'overview',
    regex: /(?:overview|summary|dashboard|report|stats|statistics)/i,
    handler: handleOverview,
    description: 'Overview queries',
  },
  {
    id: 'category_breakdown',
    regex: /(?:breakdown|distribution|split|category|categories|subject)/i,
    handler: handleCategoryBreakdown,
    description: 'Category breakdown queries',
  },
];

// ---- Utility: extract classroom codes from query ----
function extractClassroomCodes(query) {
  const codeRegex = /\b([A-Z]{2,5})-(\d[A-Z])\b/gi;
  const matches = [];
  let match;
  while ((match = codeRegex.exec(query)) !== null) {
    matches.push(match[0].toUpperCase());
  }
  return matches;
}

// ---- Utility: extract department from query ----
function extractDepartment(query) {
  const depts = ['CSE', 'ECE', 'MECH', 'IT', 'EEE', 'CIVIL', 'AIDS', 'AIML'];
  const upper = query.toUpperCase();
  return depts.find(d => upper.includes(d)) || null;
}

// ---- Utility: extract time period from query ----
function extractTimePeriod(query) {
  const lower = query.toLowerCase();
  if (lower.includes('today')) return 'today';
  if (lower.includes('this week') || lower.includes('weekly')) return 'week';
  if (lower.includes('this month') || lower.includes('monthly')) return 'month';
  if (lower.includes('last month')) return 'lastMonth';
  if (lower.includes('last week')) return 'lastWeek';
  return 'month'; // default
}

function getDateRange(period) {
  const now = new Date();
  let start;
  switch (period) {
    case 'today':
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'lastWeek':
      start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      now.setTime(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'lastMonth':
      start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      now.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }
  return { start, end: now };
}

// ---- Build student filter from scope ----
function buildStudentFilter(scope) {
  const filter = { role: 'student' };
  if (scope.classroomCode) {
    if (typeof scope.classroomCode === 'string') {
      filter.classroomCode = scope.classroomCode;
    } else {
      filter.classroomCode = scope.classroomCode; // $in query
    }
  }
  if (scope.department) filter.department = scope.department;
  if (scope.college) filter.college = scope.college;
  return filter;
}

// =====================================================================
// HANDLER IMPLEMENTATIONS
// =====================================================================

async function handleStudyTime(query, scope) {
  const codes = extractClassroomCodes(query);
  const period = extractTimePeriod(query);
  const { start, end } = getDateRange(period);

  const studentFilter = buildStudentFilter(scope);
  if (codes.length > 0) studentFilter.classroomCode = { $in: codes };

  const students = await User.find(studentFilter).select('_id classroomCode name');
  const studentIds = students.map(s => s._id);

  const agg = await Activity.aggregate([
    { $match: { user: { $in: studentIds }, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalSeconds: { $sum: '$duration' },
        sessions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalHours = Math.round(agg.reduce((s, d) => s + d.totalSeconds, 0) / 3600);
  const chartData = agg.map(d => ({
    date: d._id,
    hours: parseFloat((d.totalSeconds / 3600).toFixed(1)),
    sessions: d.sessions,
  }));

  return {
    type: 'chart',
    chartType: 'line',
    title: `Study Time Trend (${codes.length ? codes.join(', ') : 'All Classes'})`,
    summary: `Total: ${totalHours} hours across ${agg.length} days with ${studentIds.length} students in scope.`,
    data: chartData,
    dataKeys: ['hours'],
    xAxisKey: 'date',
    colors: ['#6366f1'],
  };
}

async function handleQuizScores(query, scope) {
  const codes = extractClassroomCodes(query);
  const studentFilter = buildStudentFilter(scope);
  if (codes.length > 0) studentFilter.classroomCode = { $in: codes };

  const students = await User.find(studentFilter).select('_id classroomCode name');
  const studentIds = students.map(s => s._id);

  // Group by classroom
  const studentMap = {};
  students.forEach(s => {
    studentMap[s._id.toString()] = s.classroomCode || 'Unknown';
  });

  const attempts = await QuizAttempt.find({ user: { $in: studentIds } })
    .select('user percentage')
    .lean();

  const classroomScores = {};
  attempts.forEach(a => {
    const code = studentMap[a.user.toString()] || 'Unknown';
    if (!classroomScores[code]) classroomScores[code] = [];
    classroomScores[code].push(a.percentage || 0);
  });

  const chartData = Object.entries(classroomScores).map(([code, scores]) => ({
    classroom: code,
    avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    attempts: scores.length,
    highest: Math.max(...scores),
  }));

  chartData.sort((a, b) => b.avgScore - a.avgScore);

  const overallAvg = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length)
    : 0;

  return {
    type: 'chart',
    chartType: 'bar',
    title: 'Quiz Score Analysis',
    summary: `Overall average: ${overallAvg}% across ${attempts.length} total attempts.`,
    data: chartData,
    dataKeys: ['avgScore', 'highest'],
    xAxisKey: 'classroom',
    colors: ['#6366f1', '#22c55e'],
  };
}

async function handleResumeScores(query, scope) {
  const studentFilter = buildStudentFilter(scope);
  const students = await User.find(studentFilter).select('_id classroomCode name');
  const studentIds = students.map(s => s._id);

  const studentMap = {};
  students.forEach(s => { studentMap[s._id.toString()] = s; });

  const resumes = await Resume.find({
    user: { $in: studentIds },
    'analysis.score': { $gt: 0 },
  }).select('user analysis.score').lean();

  const classroomData = {};
  resumes.forEach(r => {
    const stu = studentMap[r.user.toString()];
    const code = stu?.classroomCode || 'Unknown';
    if (!classroomData[code]) classroomData[code] = [];
    classroomData[code].push(r.analysis.score);
  });

  const chartData = Object.entries(classroomData).map(([code, scores]) => ({
    classroom: code,
    avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    count: scores.length,
    highest: Math.max(...scores),
  }));

  return {
    type: 'chart',
    chartType: 'bar',
    title: 'Resume Score Distribution',
    summary: `${resumes.length} resumes analyzed across ${Object.keys(classroomData).length} classrooms.`,
    data: chartData,
    dataKeys: ['avgScore', 'highest'],
    xAxisKey: 'classroom',
    colors: ['#8b5cf6', '#f59e0b'],
  };
}

async function handleTopPerformers(query, scope) {
  const studentFilter = buildStudentFilter(scope);
  const students = await User.find(studentFilter).select('_id classroomCode name department streak');

  const studentIds = students.map(s => s._id);

  // Aggregate study hours
  const activityAgg = await Activity.aggregate([
    { $match: { user: { $in: studentIds } } },
    { $group: { _id: '$user', totalSeconds: { $sum: '$duration' } } },
    { $sort: { totalSeconds: -1 } },
    { $limit: 15 },
  ]);

  // Get quiz averages
  const quizAgg = await QuizAttempt.aggregate([
    { $match: { user: { $in: studentIds } } },
    { $group: { _id: '$user', avgScore: { $avg: '$percentage' }, attempts: { $sum: 1 } } },
  ]);
  const quizMap = {};
  quizAgg.forEach(q => { quizMap[q._id.toString()] = q; });

  const data = activityAgg.map((a, i) => {
    const stu = students.find(s => s._id.toString() === a._id.toString());
    const quiz = quizMap[a._id.toString()];
    return {
      rank: i + 1,
      name: stu?.name || 'Unknown',
      classroom: stu?.classroomCode || '',
      department: stu?.department || '',
      studyHours: Math.round(a.totalSeconds / 3600),
      quizAvg: Math.round(quiz?.avgScore || 0),
      streak: stu?.streak?.current || 0,
    };
  });

  return {
    type: 'table',
    title: 'Top Performers',
    summary: `Top ${data.length} students ranked by total study hours.`,
    columns: ['rank', 'name', 'classroom', 'department', 'studyHours', 'quizAvg', 'streak'],
    data,
  };
}

async function handleCompare(query, scope) {
  const codes = extractClassroomCodes(query);
  if (codes.length < 2) {
    // Try department comparison
    const dept = extractDepartment(query);
    return handleDepartmentComparison(scope, dept);
  }

  // Compare specific classrooms
  const results = [];
  for (const code of codes) {
    const students = await User.find({ ...buildStudentFilter(scope), classroomCode: code }).select('_id');
    const ids = students.map(s => s._id);

    const actAgg = await Activity.aggregate([
      { $match: { user: { $in: ids } } },
      { $group: { _id: null, totalSeconds: { $sum: '$duration' } } },
    ]);
    const quizAgg = await QuizAttempt.aggregate([
      { $match: { user: { $in: ids } } },
      { $group: { _id: null, avg: { $avg: '$percentage' }, count: { $sum: 1 } } },
    ]);

    results.push({
      classroom: code,
      students: students.length,
      studyHours: Math.round((actAgg[0]?.totalSeconds || 0) / 3600),
      quizAvg: Math.round(quizAgg[0]?.avg || 0),
      quizAttempts: quizAgg[0]?.count || 0,
    });
  }

  return {
    type: 'chart',
    chartType: 'radar',
    title: `Comparison: ${codes.join(' vs ')}`,
    summary: `Side-by-side comparison of ${codes.length} classrooms.`,
    data: results,
    dataKeys: ['studyHours', 'quizAvg', 'quizAttempts', 'students'],
    xAxisKey: 'classroom',
    colors: ['#6366f1', '#f43f5e', '#22c55e', '#f59e0b'],
  };
}

async function handleDepartmentComparison(scope) {
  const filter = buildStudentFilter(scope);
  delete filter.department;
  const students = await User.find(filter).select('_id department');

  const depts = {};
  students.forEach(s => {
    const d = s.department || 'Unknown';
    if (!depts[d]) depts[d] = [];
    depts[d].push(s._id);
  });

  const data = [];
  for (const [dept, ids] of Object.entries(depts)) {
    const actAgg = await Activity.aggregate([
      { $match: { user: { $in: ids } } },
      { $group: { _id: null, totalSeconds: { $sum: '$duration' } } },
    ]);
    const quizAgg = await QuizAttempt.aggregate([
      { $match: { user: { $in: ids } } },
      { $group: { _id: null, avg: { $avg: '$percentage' } } },
    ]);
    data.push({
      department: dept,
      students: ids.length,
      studyHours: Math.round((actAgg[0]?.totalSeconds || 0) / 3600),
      quizAvg: Math.round(quizAgg[0]?.avg || 0),
    });
  }

  return {
    type: 'chart',
    chartType: 'bar',
    title: 'Department Comparison',
    summary: `Comparing ${data.length} departments.`,
    data,
    dataKeys: ['studyHours', 'quizAvg', 'students'],
    xAxisKey: 'department',
    colors: ['#6366f1', '#22c55e', '#f59e0b'],
  };
}

async function handleAttendance(query, scope) {
  const codes = extractClassroomCodes(query);
  const period = extractTimePeriod(query);
  const { start, end } = getDateRange(period);

  let matchFilter = { date: { $gte: start, $lte: end } };
  if (codes.length > 0) {
    matchFilter.classroomCode = { $in: codes };
  } else if (scope.classroomCode) {
    matchFilter.classroomCode = scope.classroomCode;
  } else if (scope.department) {
    // Get all classroom codes in department
    const classStudents = await User.distinct('classroomCode', {
      role: 'student',
      department: scope.department,
      college: scope.college,
    });
    matchFilter.classroomCode = { $in: classStudents };
  }

  const records = await Attendance.find(matchFilter).lean();

  // Aggregate per classroom
  const classData = {};
  records.forEach(rec => {
    const code = rec.classroomCode;
    if (!classData[code]) classData[code] = { present: 0, total: 0 };
    rec.records.forEach(r => {
      classData[code].total++;
      if (r.status === 'present') classData[code].present++;
    });
  });

  const chartData = Object.entries(classData).map(([code, d]) => ({
    classroom: code,
    percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    totalRecords: d.total,
  }));

  return {
    type: 'chart',
    chartType: 'bar',
    title: 'Attendance Overview',
    summary: `Attendance data for ${chartData.length} classrooms.`,
    data: chartData,
    dataKeys: ['percentage'],
    xAxisKey: 'classroom',
    colors: ['#22c55e'],
  };
}

async function handleAtRisk(query, scope) {
  const studentFilter = buildStudentFilter(scope);
  const students = await User.find(studentFilter).select('_id classroomCode name department streak');
  const studentIds = students.map(s => s._id);

  // Get activity in last 14 days
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const activityAgg = await Activity.aggregate([
    { $match: { user: { $in: studentIds }, date: { $gte: twoWeeksAgo } } },
    { $group: { _id: '$user', totalSeconds: { $sum: '$duration' }, lastActive: { $max: '$date' } } },
  ]);
  const activityMap = {};
  activityAgg.forEach(a => { activityMap[a._id.toString()] = a; });

  // Get quiz scores
  const quizAgg = await QuizAttempt.aggregate([
    { $match: { user: { $in: studentIds } } },
    { $group: { _id: '$user', avgScore: { $avg: '$percentage' } } },
  ]);
  const quizMap = {};
  quizAgg.forEach(q => { quizMap[q._id.toString()] = q; });

  // Flag students with low activity or scores
  const atRisk = students
    .map(s => {
      const activity = activityMap[s._id.toString()];
      const quiz = quizMap[s._id.toString()];
      const studyHours = activity ? Math.round(activity.totalSeconds / 3600) : 0;
      const quizAvg = Math.round(quiz?.avgScore || 0);
      const streak = s.streak?.current || 0;
      const daysInactive = activity?.lastActive
        ? Math.round((Date.now() - new Date(activity.lastActive).getTime()) / (1000 * 60 * 60 * 24))
        : 99;

      let riskScore = 0;
      if (studyHours < 2) riskScore += 3;
      if (quizAvg < 40) riskScore += 3;
      if (daysInactive > 7) riskScore += 4;
      if (streak === 0) riskScore += 1;

      return {
        name: s.name,
        classroom: s.classroomCode || '',
        department: s.department || '',
        studyHours,
        quizAvg,
        daysInactive,
        riskScore,
        riskLevel: riskScore >= 7 ? 'HIGH' : riskScore >= 4 ? 'MEDIUM' : 'LOW',
      };
    })
    .filter(s => s.riskScore >= 4)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 20);

  return {
    type: 'table',
    title: 'At-Risk Students',
    summary: `${atRisk.length} students flagged as at-risk based on low activity, quiz scores, and inactivity.`,
    columns: ['name', 'classroom', 'department', 'studyHours', 'quizAvg', 'daysInactive', 'riskLevel'],
    data: atRisk,
  };
}

async function handleTrends(query, scope) {
  const period = extractTimePeriod(query);
  const codes = extractClassroomCodes(query);

  let periodType = 'daily';
  if (period === 'month' || period === 'lastMonth') periodType = 'daily';
  if (period === 'week' || period === 'lastWeek') periodType = 'daily';

  let filter = { period: periodType };

  if (codes.length > 0) {
    filter.classroomCode = { $in: codes };
  } else if (scope.department) {
    filter.department = scope.department;
  }
  if (scope.college) filter.college = scope.college;

  const snapshots = await ClassroomAnalytics.find(filter)
    .sort({ date: -1 })
    .limit(30)
    .lean();

  if (snapshots.length === 0) {
    // Fall back to live calculation
    return handleStudyTime(query, scope);
  }

  const chartData = snapshots.reverse().map(s => ({
    date: new Date(s.date).toISOString().split('T')[0],
    studyHours: s.metrics.totalStudyHours,
    quizAvg: s.metrics.averageQuizScore,
    activeStudents: s.metrics.activeStudents,
  }));

  return {
    type: 'chart',
    chartType: 'line',
    title: 'Performance Trends',
    summary: `Showing ${chartData.length} data points of aggregated trends.`,
    data: chartData,
    dataKeys: ['studyHours', 'quizAvg', 'activeStudents'],
    xAxisKey: 'date',
    colors: ['#6366f1', '#22c55e', '#f59e0b'],
  };
}

async function handleOverview(query, scope) {
  const studentFilter = buildStudentFilter(scope);
  const students = await User.find(studentFilter).select('_id streak');
  const studentIds = students.map(s => s._id);
  const totalStudents = students.length;

  // Active students (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeStudents = await Activity.distinct('user', {
    user: { $in: studentIds },
    date: { $gte: weekAgo },
  });

  // Total study hours (last 30 days)
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const actAgg = await Activity.aggregate([
    { $match: { user: { $in: studentIds }, date: { $gte: monthAgo } } },
    { $group: { _id: null, total: { $sum: '$duration' } } },
  ]);
  const totalStudyHours = Math.round((actAgg[0]?.total || 0) / 3600);

  // Quiz average
  const quizAgg = await QuizAttempt.aggregate([
    { $match: { user: { $in: studentIds } } },
    { $group: { _id: null, avg: { $avg: '$percentage' }, count: { $sum: 1 } } },
  ]);

  // Resume average
  const resumeAgg = await Resume.aggregate([
    { $match: { user: { $in: studentIds }, 'analysis.score': { $gt: 0 } } },
    { $group: { _id: null, avg: { $avg: '$analysis.score' } } },
  ]);

  // Average streak
  const avgStreak = students.length
    ? Math.round(students.reduce((s, st) => s + (st.streak?.current || 0), 0) / students.length)
    : 0;

  return {
    type: 'stats',
    title: 'Overview',
    summary: `Dashboard overview for ${totalStudents} students in scope.`,
    data: [
      { label: 'Total Students', value: totalStudents, icon: 'users', color: '#6366f1' },
      { label: 'Active This Week', value: activeStudents.length, icon: 'activity', color: '#22c55e' },
      { label: 'Study Hours (30d)', value: totalStudyHours, icon: 'clock', color: '#f59e0b' },
      { label: 'Avg Quiz Score', value: `${Math.round(quizAgg[0]?.avg || 0)}%`, icon: 'trophy', color: '#8b5cf6' },
      { label: 'Avg Resume Score', value: Math.round(resumeAgg[0]?.avg || 0), icon: 'file', color: '#ec4899' },
      { label: 'Avg Streak', value: `${avgStreak} days`, icon: 'flame', color: '#f43f5e' },
    ],
  };
}

async function handleCategoryBreakdown(query, scope) {
  const studentFilter = buildStudentFilter(scope);
  const students = await User.find(studentFilter).select('_id');
  const studentIds = students.map(s => s._id);

  const agg = await Activity.aggregate([
    { $match: { user: { $in: studentIds } } },
    {
      $group: {
        _id: '$category',
        totalSeconds: { $sum: '$duration' },
        sessions: { $sum: 1 },
      },
    },
    { $sort: { totalSeconds: -1 } },
  ]);

  const chartData = agg.map(d => ({
    name: d._id,
    hours: parseFloat((d.totalSeconds / 3600).toFixed(1)),
    sessions: d.sessions,
  }));

  return {
    type: 'chart',
    chartType: 'pie',
    title: 'Study Category Breakdown',
    summary: `Distribution across ${chartData.length} categories.`,
    data: chartData,
    dataKeys: ['hours'],
    nameKey: 'name',
    colors: ['#6366f1', '#22c55e', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'],
  };
}

// =====================================================================
// MAIN QUERY FUNCTION
// =====================================================================

export async function processQuery(queryText, scope) {
  if (!queryText || queryText.trim().length < 3) {
    return {
      type: 'text',
      title: 'How can I help?',
      summary: 'Ask me about your students\' performance. Try one of the suggested queries below.',
      suggestions: [
        'Show me study time trends',
        'Who are the top performers?',
        'What are the average quiz scores?',
        'Show attendance overview',
        'Which students are at risk?',
        'Compare CSE-3A vs CSE-3B',
        'Show category breakdown',
        'Give me an overview',
      ],
    };
  }

  // Match against patterns
  for (const pattern of PATTERNS) {
    if (pattern.regex.test(queryText)) {
      try {
        const result = await pattern.handler(queryText, scope);
        result.suggestions = [
          'Show study time trends',
          'Who are the top performers?',
          'Which students are at risk?',
          'Show category breakdown',
        ];
        return result;
      } catch (err) {
        console.error(`Query handler error (${pattern.id}):`, err);
        return {
          type: 'text',
          title: 'Query Error',
          summary: `I understood your question about "${pattern.description}" but encountered an error processing it. Please try again.`,
          suggestions: ['Show me an overview', 'Who are the top performers?'],
        };
      }
    }
  }

  // No pattern matched
  return {
    type: 'text',
    title: 'I didn\'t quite understand that',
    summary: `I can answer questions about study time, quiz scores, resume scores, attendance, top performers, at-risk students, trends, and comparisons. Try rephrasing your question or use one of the suggestions below.`,
    suggestions: [
      'Show me study time trends',
      'Who are the top performers?',
      'What are the average quiz scores?',
      'Show attendance overview',
      'Which students are at risk?',
      'Compare departments',
      'Show category breakdown',
      'Give me an overview',
    ],
  };
}
