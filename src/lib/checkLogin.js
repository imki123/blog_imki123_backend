const checkLogin = (ctx, next) => {
    console.log(ctx.state.user)
    if(!ctx.state.user){
        ctx.status = 401 //Unauthorized
        return
    }
    return next()
}

module.exports = checkLogin