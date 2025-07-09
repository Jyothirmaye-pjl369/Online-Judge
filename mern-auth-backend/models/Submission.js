const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['python', 'cpp', 'c'], // Add more as needed
    default: 'python'
  },
  status: {
    type: String,
    enum: ['Pending', 'Passed', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Failed'],
    default: 'Pending'
  },
  output: {
    type: String
  },
  error: {
    type: String
  },
  runtime: {
    type: Number // in ms
  },
  memory: {
    type: Number // in KB or MB
  },
  results: [
    {
      input: String,
      expected: String,
      output: String,
      passed: Boolean,
      error: String
    }
  ]
}, {
  timestamps: true // ✅ Automatically adds createdAt & updatedAt
});

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
