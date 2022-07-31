import mongoose from 'mongoose'

const { Schema } = mongoose
const PostBodySchema = new Schema({
  postId: Number,
  body: Object,
})

export const PostBody = mongoose.model('PostBody', PostBodySchema)
// Collection name 'PostBody' will change to 'postbodies'
