import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';

// @desc    Create an assignment
// @route   POST /api/assessment/assignment
// @access  Private (Faculty/HOD)
export const createAssignment = async (req, res) => {
  try {
    const { classroomCode, subject, title, description, deadline, maxMarks } = req.body;

    const assignment = await Assignment.create({
      classroomCode,
      subject,
      title,
      description,
      deadline,
      maxMarks,
      createdBy: req.user._id,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment', error: error.message });
  }
};

// @desc    Get assignments for a specific classroom
// @route   GET /api/assessment/assignment/:code
// @access  Private
export const getClassroomAssignments = async (req, res) => {
  try {
    const { code } = req.params;
    const assignments = await Assignment.find({ classroomCode: code }).sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// @desc    Submit an assignment (Student)
// @route   POST /api/assessment/assignment/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res) => {
  try {
    const { fileUrl, text } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const isLate = new Date() > new Date(assignment.deadline);

    // Check if user already submitted
    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub) => sub.studentId.toString() === req.user._id.toString()
    );

    if (existingSubmissionIndex !== -1) {
      // Update existing
      assignment.submissions[existingSubmissionIndex].fileUrl = fileUrl || assignment.submissions[existingSubmissionIndex].fileUrl;
      assignment.submissions[existingSubmissionIndex].text = text || assignment.submissions[existingSubmissionIndex].text;
      assignment.submissions[existingSubmissionIndex].submittedAt = Date.now();
      assignment.submissions[existingSubmissionIndex].isLate = isLate;
    } else {
      // Add new
      assignment.submissions.push({
        studentId: req.user._id,
        fileUrl,
        text,
        submittedAt: Date.now(),
        isLate,
      });
    }

    await assignment.save();
    res.status(200).json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting assignment', error: error.message });
  }
};

// @desc    Grade an assignment (Faculty)
// @route   PUT /api/assessment/assignment/:id/grade
// @access  Private (Faculty/HOD)
export const gradeAssignment = async (req, res) => {
  try {
    const { studentId, grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const subIndex = assignment.submissions.findIndex((sub) => sub.studentId.toString() === studentId);
    if (subIndex === -1) {
      return res.status(404).json({ message: 'Submission not found for this student' });
    }

    assignment.submissions[subIndex].grade = grade;
    assignment.submissions[subIndex].feedback = feedback;

    await assignment.save();
    res.status(200).json({ message: 'Assignment graded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error grading assignment', error: error.message });
  }
};

// @desc    Mark attendance
// @route   POST /api/assessment/attendance
// @access  Private (Faculty/HOD)
export const markAttendance = async (req, res) => {
  try {
    const { classroomCode, date, records } = req.body;

    // Remove the time portion to index by day
    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ classroomCode, date: dayDate });

    if (attendance) {
      // Update records
      attendance.records = records;
      attendance.markedBy = req.user._id;
    } else {
      // Create new
      attendance = await Attendance.create({
        classroomCode,
        date: dayDate,
        markedBy: req.user._id,
        records,
      });
    }

    await attendance.save();
    res.status(200).json({ message: 'Attendance recorded', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

// @desc    Get attendance for a classroom
// @route   GET /api/assessment/attendance/:code
// @access  Private
export const getClassroomAttendance = async (req, res) => {
  try {
    const { code } = req.params;
    const { date } = req.query; // optional specific date filter
    
    let filter = { classroomCode: code };
    if (date) {
      const dayDate = new Date(date);
      dayDate.setHours(0, 0, 0, 0);
      filter.date = dayDate;
    }

    const attendanceRecords = await Attendance.find(filter).sort({ date: -1 }).populate('markedBy', 'name email');
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

// @desc    Create an announcement
// @route   POST /api/assessment/announcement
// @access  Private (Faculty/HOD/Principal)
export const createAnnouncement = async (req, res) => {
  try {
    const { classroomCodes, title, content, isPinned } = req.body;

    const announcement = await Announcement.create({
      classroomCodes,
      title,
      content,
      isPinned,
      createdBy: req.user._id,
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
};

// @desc    Get announcements for a classroom
// @route   GET /api/assessment/announcement/:code
// @access  Private
export const getClassroomAnnouncements = async (req, res) => {
  try {
    const { code } = req.params;
    // Also include announcements targeted globally or to this specific code
    const announcements = await Announcement.find({ 
      classroomCodes: { $in: [code, 'ALL'] } 
    }).sort({ isPinned: -1, createdAt: -1 });
    
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error: error.message });
  }
};
