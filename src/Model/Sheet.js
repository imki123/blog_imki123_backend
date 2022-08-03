import mongoose from 'mongoose'

const { Schema } = mongoose
const SheetSchema = new Schema({
  sheetId: Number,
  name: String,
  order: Number,
  table: [[String | Number]],
})

export const Sheet = mongoose.model('Sheet', SheetSchema)
// Collection name 'Sheet' will change to 'sheets'
