import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['hackathon', 'contest', 'internship', 'placement', 'workshop'],
      required: true 
    },
    date: { type: Date, required: true },
    link: { type: String },
    college: { type: String, required: true }, // To filter events by college
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
