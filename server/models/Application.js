/**
 * Application Model
 * Tracks job applications submitted by users (job seekers)
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    resume: {
      type: String, // URL to resume or plain text resume link
      default: '',
      trim: true,
    },
    coverLetter: {
      type: String,
      default: '',
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['applied', 'reviewing', 'selected', 'rejected'],
        message: 'Status must be: applied, reviewing, selected, or rejected',
      },
      default: 'applied',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from applying to the same job twice
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
