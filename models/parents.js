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

module.exports = mongoose.model('Parent', schema)