const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const schema = new Schema({
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  gender: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true, enum: ['admin', 'coach', 'parent', 'visitor'], default:'visitor'},
  active: {type: Boolean, default: true}
})

module.exports = mongoose.model("User", schema)