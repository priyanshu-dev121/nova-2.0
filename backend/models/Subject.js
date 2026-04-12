const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: String, default: 'General' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
