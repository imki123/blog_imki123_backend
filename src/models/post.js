const mongoose = require('mongoose')

const {Schema} = mongoose
const PostSchema = new Schema({
    postId: {
        type: Number,
        default: 1
    },
    title: String,
    body: String, 
    tags: [String],
    publishedDate: {
        type: Date,
        default: Date.now //현재날짜 기본값
    },
})

const Post = mongoose.model('Post', PostSchema)
module.exports = Post