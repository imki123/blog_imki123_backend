const Router = require('koa-router')
const Post = require('../models/post')
const Joi = require('joi')
const router = new Router()

/* post: patch(/comments/:postId)
update: patch(/comments/:postId/:commentId)
delete: patch(/comments/delete/:postId/:commentId) */

// 댓글 추가 post: patch(/comments/:postId)
router.patch('/:postId', async ctx => {	
	try {
        const { postId } = ctx.params

        const post = await Post.findOne({ postId: postId })
		if (post) {
            const comments = post.comments
            let commentId = 1
            if(comments.length > 0){
                commentId = comments[comments.length-1].commentId + 1 //commentId가 있으면 +1하고 없으면 1
            }

            comments.push({ //추가할 댓글 정보 (commendId, username, content, publishedDate)
                commentId: commentId, 
                username: ctx.state.user.username,
                //username: ctx.request.body.username, //로컬에서는 state가 protocol 차이로 정상적으로 동작이 안됨.
                content: ctx.request.body.content,
                publishedDate: () => new Date(+new Date() + 9*60*60*1000),
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
//특정 포스트의 특정 댓글수정 update: patch(/comments/:postId/:commentId)
router.patch('/:postId/:commentId', async (ctx) => {
    try {
        const { postId, commentId } = ctx.params
        const post = await Post.findOne({ postId: postId })
        if (post) {
            let comments = post.comments
            for(let i of comments){
                if(i.commentId === Number(commentId)){
                    i.content = ctx.request.body.content
                    i.publishedDate = () => new Date(+new Date() + 9*60*60*1000)
                    i.updated = true
                }
            }
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
//특정 포스트의 특정 댓글삭제 delete: patch(/comments/delete/:postId/:commentId)
router.patch('/delete/:postId/:commentId', async (ctx) => {
    try {
        const { postId, commentId } = ctx.params
        const post = await Post.findOne({ postId: postId })
        if (post) {
            let comments = post.comments
            comments = comments.filter(i => i.commentId !== Number(commentId))
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