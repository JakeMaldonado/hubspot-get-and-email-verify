'use strict';
const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String
});
module.exports = mongoose.model('Contact', contactSchema);
