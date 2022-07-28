const mongoose = require('mongoose')

const { Schema } = mongoose
const SheetSchema = new Schema({
  sheetId: Number,
  name: String,
  table: Object,
})

const Sheet = mongoose.model('Sheet', SheetSchema)
module.exports = Sheet
