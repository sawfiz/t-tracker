const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const schema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, required: true, enum: ['admin', 'coach', 'parent', 'visitor'], default:'visitor'}
})

module.exports = mongoose.model("User", schema)