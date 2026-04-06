import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createAssignment,
  getClassroomAssignments,
  submitAssignment,
  gradeAssignment,
  markAttendance,
  getClassroomAttendance,
  createAnnouncement,
  getClassroomAnnouncements
} from '../controllers/assessmentController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Assignments
router.post('/assignment', authorize('faculty', 'hod', 'principal'), createAssignment);
router.get('/assignment/:code', getClassroomAssignments);
router.post('/assignment/:id/submit', authorize('student'), submitAssignment);
router.put('/assignment/:id/grade', authorize('faculty', 'hod', 'principal'), gradeAssignment);

// Attendance
router.post('/attendance', authorize('faculty', 'hod', 'principal'), markAttendance);
router.get('/attendance/:code', getClassroomAttendance);

// Announcements
router.post('/announcement', authorize('faculty', 'hod', 'principal', 'placement'), createAnnouncement);
router.get('/announcement/:code', getClassroomAnnouncements);

export default router;
