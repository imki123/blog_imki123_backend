const mongoose = require('mongoose')

const { Schema } = mongoose
const SheetSchema = new Schema({
  // sheetId: Number,
  // name: String,
  name: String,
  count: {
    type: Number,
    default: 1,
  },
})

const Sheet = mongoose.model('Sheet', SheetSchema)
// Collection name 'Sheet' will change to 'sheets'
module.exports = Sheet
