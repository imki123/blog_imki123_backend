import mongoose from 'mongoose'

const { Schema } = mongoose
const TypeSchema = new Schema({
  typeId: Number,
  types: [],
})

export const Type = mongoose.model('Type', TypeSchema)
// Collection name 'Type' will change to 'types'
