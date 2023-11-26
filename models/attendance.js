const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  date: { type: Date },
  venue: { type: String, maxlentgh: 15 },
  coachs: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  athletes: [{ type: Schema.Types.ObjectId, ref: 'Athlete' }],
});

module.exports = mongoose.model('Attendance', schema);
