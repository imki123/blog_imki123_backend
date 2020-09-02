const Router = require('koa-router')
const Post = require('../models/post')
const router = new Router()

// posts 종류 : get/, post/, get/:id, delete/:id, put/:id, patch/:id
// 라우터 설정

//포스트 전체 목록
router.get('/', async ctx => {
    try{
        const posts = await Post.find().exec()
        ctx.body = posts
    }catch(e){
        console.error(500, e)
    }
    
})
//포스트 작성
router.post('/', async ctx => {
    console.log(ctx)
    const {title, body, tags} = ctx.request.body
    const post = new Post({
        title,
        body,
        tags,
    })
    try{
        await post.save()
        ctx.body = post
    } catch(e){
        ctx.throw(500, e)
    }
})
//특정 포스트 조회
router.get('/:id', ctx => {
    ctx.body = 'read'
})
//특정 포스트 삭제
router.delete('/:id', ctx => {
    ctx.body = 'delete'
})
//특정 포스트 수정
router.patch('/:id', ctx => {
    ctx.body = 'update'
})

module.exports = router