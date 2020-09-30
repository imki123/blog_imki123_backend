const mongoose = require('mongoose')

const {Schema} = mongoose
const PostBodySchema = new Schema({
    postId: Number,
    body: Object,
})

const PostBody = mongoose.model('PostBody', PostBodySchema)
module.exports = PostBody