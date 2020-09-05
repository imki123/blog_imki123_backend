const checkOwnPost = (ctx, next) => {
    const {user, post} = ctx.state
    if(post.user._id.toString() !== user._id){
        ctx.status = 403 //
        return
    }
    return next()
}

module.exports = checkOwnPost