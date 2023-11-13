const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  first_name: { type: String, require: true, maxlength: 20 },
  last_name: { type: String, require: true, maxlength: 20 },
  gender: {type: String, enum:['male', 'female']},
  birthdate: { type: Date },
  mobile: { type: String, maxlentgh: 15 },
  email: { type: String, maxlength: 50 },
  school: { type: String, maxlength: 50 },
  time_trails: [{ type: Schema.Types.ObjectId, ref: 'Timetrial' }],
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
});

// Virtual for full name
schema.virtual('name').get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = '';
  if (this.first_name && this.last_name) {
    fullname = `${this.last_name}, ${this.first_name}`;
  }
  return fullname;
});

// Virtual for birthdate in YYYY-MM-DD format
schema.virtual("birthdate_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.birthdate).toISODate(); // format 'YYYY-MM-DD'
});


schema.virtual('url').get(function () {
  return `/data/athlete/${this._id}`;
});

module.exports = mongoose.model('Athlete', schema);
