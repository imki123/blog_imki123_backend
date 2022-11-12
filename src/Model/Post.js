import mongoose from 'mongoose'

const { Schema } = mongoose
const PostSchema = new Schema({
  postId: {
    type: Number,
    default: 1,
  },
  title: String,
  body: Object,
  text: String,
  views: {
    type: Number,
    default: 0,
  },
  tags: [String],
  thumbnail: Object,
  publishedDate: {
    type: Date,
    default: () => new Date(new Date().getTime() + 9 * 60 * 60 * 1000), // 한국 +9시간
  },
  user: {
    username: String,
  },
  comments: [
    {
      commentId: Number,
      username: String,
      content: String,
      publishedDate: {
        type: Date,
        default: () => new Date(new Date().getTime() + 9 * 60 * 60 * 1000), // 한국 +9시간
      },
      updated: {
        type: Boolean,
        default: false,
      },
    },
  ],
})

export const Post = mongoose.model('Post', PostSchema)
// Collection name 'Post' will change to 'posts'
