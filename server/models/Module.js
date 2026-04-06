import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { 
      type: String, 
      enum: ['programming', 'ai', 'aptitude', 'database', 'devops', 'system-design', 'core_cs'],
      required: true 
    },
    description: { type: String },
    icon: { type: String },
    lessons: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true }, // Markdown content
        order: { type: Number, required: true },
        duration: { type: Number, default: 10 } // min
      }
    ],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Module', moduleSchema);
