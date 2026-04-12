const mongoose = require('mongoose');

const noticeSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: String, enum: ['All', 'Student', 'Faculty'], default: 'All' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
