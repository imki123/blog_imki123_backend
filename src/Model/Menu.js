import mongoose from 'mongoose'

const { Schema } = mongoose
const MenuSchema = new Schema({
  name: String,
  count: {
    type: Number,
    default: 1,
  },
  level: {
    type: Number,
    default: 1,
  },
  order: {
    type: Number,
    default: 100,
  },
  parent: String,
})

export const Menu = mongoose.model('Menu', MenuSchema)
// Collection name 'Menu' will change to 'menus'
