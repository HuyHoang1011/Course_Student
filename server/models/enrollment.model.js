const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'cancelled'], default: 'pending' },
  approvedAt: { type: Date }, // When enrollment was approved
  cancelledAt: { type: Date }, // When enrollment was cancelled
  completedQuizSets: [{ type: String }], // Array of completed (passed) quiz set IDs
  attemptedQuizSets: [{ type: String }], // Array of attempted quiz set IDs (regardless of pass/fail)
  instructorApproved: { type: Boolean, default: false }, // Instructor approval for course completion
  graduatedAt: { type: Date, default: null }
}, { timestamps: true });

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1, status: 1 });

module.exports = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
