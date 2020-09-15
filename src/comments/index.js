const Router = require('koa-router')
const Post = require('../models/post')
const Joi = require('joi')
const router = new Router()

/* post: patch(/comments/:postId)
update: patch(/comments/:postId/:commentsId)
delete: delete(/comments/:postId/:commentsId) */

// 댓글 추가 post: patch(/comments/:postId)
router.patch('/:postId', async ctx => {	
	try {
        const { postId } = ctx.params

        const post = await Post.findOne({ postId: postId })
		if (post) {
            console.log(post)
            const comments = post.comments
            let commentId = 1
            if(comments.length > 0){
                commentId = comments[comments.length-1].commentId + 1 //commentId가 있으면 +1하고 없으면 1
            }

            comments.push({ //추가할 댓글 정보 (commendId, username, content, publishedDate)
                commentId: commentId, 
                //username: ctx.state.user.username,
                username: ctx.request.body.username,
                content: ctx.request.body.content,
                publishedDate: Date.now,
            })
            const updated = await Post.findOneAndUpdate({ postId: postId },
                {
                    comments: comments, 
                },
                {new: true}, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
            )
			ctx.body = updated
		} else {
			ctx.status = 204 //No content
			return
		}
	} catch (e) {
		ctx.throw(500, e)
	}
})

module.exports = router