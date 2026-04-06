import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    classroomCodes: [
      {
        type: String,
        required: true,
        index: true,
      },
    ],
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [String], // file URLs
    isPinned: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
