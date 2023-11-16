const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema(
  {
    first_name: { type: String, require: true, maxlength: 20 },
    last_name: { type: String, require: true, maxlength: 20 },
    gender: { type: String, enum: ['male', 'female'] },
    birthdate: { type: Date },
    father: { type: Schema.Types.ObjectId, ref: 'Parent' },
    mother: { type: Schema.Types.ObjectId, ref: 'Parent' },
    mobile: { type: String, maxlentgh: 15 },
    email: { type: String, maxlength: 50 },
    school: { type: String, maxlength: 50 },
    time_trails: [{ type: Schema.Types.ObjectId, ref: 'Timetrial' }],
    notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
    active: { type: Boolean, default: true },
    photoUrl: { type: String },
  },
  {
    toJSON: { virtuals: true }, // <-- include virtuals in `JSON.stringify()`
  }
);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Virtual for full name
schema.virtual('name').get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = '';
  if (this.first_name && this.last_name) {
    fullname = `${capitalizeFirstLetter(
      this.first_name
    )} ${capitalizeFirstLetter(this.last_name)}`;
  }
  return fullname;
});

module.exports = mongoose.model('Athlete', schema);
