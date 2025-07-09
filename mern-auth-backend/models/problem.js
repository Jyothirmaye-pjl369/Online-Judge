const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
  },
  inputFormat: {
    type: String,
  },
  outputFormat: {
    type: String,
  },
  constraints: {
    type: String,
  },
  sampleInput: {
    type: String,
  },
  sampleOutput: {
    type: String,
  },
  testCases: [
    {
      input: {
        type: String,
        required: true,
      },
      expectedOutput: {
        type: String,
        required: true,
      }
    }
  ],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [{ type: String }],
}, { timestamps: true });

// Prevent OverwriteModelError in dev/hot-reload
module.exports = mongoose.models.Problem || mongoose.model('Problem', problemSchema);
