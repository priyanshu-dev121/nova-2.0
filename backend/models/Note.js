const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    fileUrl: { type: String, required: true }, // For actual implementation, this would be a URL
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isOfficial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
