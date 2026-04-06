import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'hod', 'principal', 'placement'],
      default: 'student',
    },
    college: {
      type: String,
      required: [true, 'Please add a college name'],
    },
    department: {
      type: String,
    },
    year: {
      type: Number,
      min: 1,
      max: 4,
    },
    section: {
      type: String,
    },
    classroomCode: {
      type: String,
    },
    assignedClassrooms: {
      type: [String],
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
    },
    dailyTasks: [
      {
        text: String,
        completed: { type: Boolean, default: false },
        date: Date,
      }
    ],
    profilePicture: {
      type: String,
      default: 'default.jpg',
    },
    skills: {
      type: [String],
    },
    targets: {
      companies: [String],
      roles: [String],
      timeline: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
