/**
 * Job Model
 * Represents job listings posted by recruiters
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [80, 'Company name cannot exceed 80 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    salary: {
      type: String,
      default: 'Not Disclosed',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [30, 'Description must be at least 30 characters'],
    },
    requirements: [{ type: String, trim: true }],
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'],
      default: 'Full-time',
    },
    category: {
      type: String,
      enum: [
        'Technology', 'Design', 'Marketing', 'Sales', 'Finance',
        'Healthcare', 'Education', 'Engineering', 'HR', 'Other',
      ],
      default: 'Technology',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
      default: 'Entry Level',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search on title, company, and description
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ createdAt: -1 }); // Index for sorting by newest

module.exports = mongoose.model('Job', jobSchema);
