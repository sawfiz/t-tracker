const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const schema = new Schema({
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  gender: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
  mobile: {type: String, required: true},
  email: {type: String},
  role: {type: String, required: true, enum: ['admin', 'coach', 'parent', 'visitor'], default:'visitor'},
  active: {type: Boolean, default: true}
},
{
  toJSON: { virtuals: true }, // <-- include virtuals in `JSON.stringify()`
})


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

module.exports = mongoose.model("User", schema)