const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  first_name: { type: String, require: true, maxlength: 20 },
  last_name: { type: String, require: true, maxlength: 20 },
  mobile: { type: String, required: true, maxlentgh: 15 },
  email: { type: String, required: true, maxlength: 50 },
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
});

schema.virtual('url').get(function () {
  return '/data/parent/${this._id}';
});

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

module.exports = mongoose.model('Parent', schema)