const mongoose = require('mongoose')

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
    default: () => new Date(new Date().getTime() + 9 * 60 * 60 * 1000), //현재날짜 기본값
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
        default: () => new Date(new Date().getTime() + 9 * 60 * 60 * 1000), //현재날짜 기본값
      },
      updated: {
        type: Boolean,
        default: false,
      },
    },
  ],
})

const Post = mongoose.model('Post', PostSchema)
module.exports = Post
