import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    classroomCode: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'late'],
          default: 'present',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for the same class on the same day
attendanceSchema.index({ classroomCode: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
