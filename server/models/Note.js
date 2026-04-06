import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { type: String, required: true },
    content: { type: String }, // Can be rich text or markdown
    topic: { type: String }, // e.g. Java, Interview Prep
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
