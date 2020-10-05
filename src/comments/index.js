const Router = require('koa-router')
const Post = require('../models/post')
const router = new Router()

/*
get: get(/comments/:postId), (/comments/recent)
post: patch(/comments/:postId)
update: patch(/comments/:postId/:commentId)
delete: patch(/comments/delete/:postId/:commentId) 

*/

// 댓글 불러오기(새로고침) get: get(/comments/:postId)
router.get('/:postId', async (ctx) => {
	try {
		const { postId } = ctx.params

		if (!isNaN(Number(postId))) {
			const post = await Post.findOne({ postId: Number(postId) })
			if (post) {
				ctx.body = post.comments
			} else {
				ctx.status = 204 //No content
				return
			}
		} else if (postId === 'recent' || postId === 'recentAll') {
			const posts = await Post.find()
			const comments = []
			if (posts) {
				for (let i of posts) {
                    for (let j of i.comments) {
                        let comment = {}
                        comment.postId = i.postId
                        comment.title = i.title
                        comment.content = j.content
                        comment.username = j.username
                        comment.publishedDate = j.publishedDate
                        comments.push(comment)
                    }
				}
				comments.sort(function (a, b) {
					return b.publishedDate - a.publishedDate
                }) //내림차순

                if(postId === 'recent') comments.splice(10) //recent면 10개만 추출(0~9)
				ctx.body = comments
			} else {
				ctx.status = 404 //Not found
				return
			}
		}
	} catch (e) {
		ctx.throw(500, e)
	}
})
// 댓글 추가 post: patch(/comments/:postId)
router.patch('/:postId', async (ctx) => {
	try {
		const { postId } = ctx.params

		const post = await Post.findOne({ postId: Number(postId) })
		if (post) {
			const comments = post.comments
			let commentId = 1
			if (comments && comments.length > 0) {
				commentId = comments[comments.length - 1].commentId + 1 //commentId가 있으면 +1하고 없으면 1
			}

			comments.push({
				//추가할 댓글 정보 (commendId, username, content, publishedDate)
				commentId: commentId,
				username: (ctx.state.user && ctx.state.user.username) || ctx.request.body.data.username, //로컬에서는 state가 프로토콜 차이로 정상적으로 동작이 안됨.
				content: ctx.request.body.data.content,
				publishedDate: new Date(new Date().getTime() + 9 * 60 * 60 * 1000),
			})
			const updated = await Post.findOneAndUpdate(
				{ postId: postId },
				{
					comments: comments,
				},
				{ new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
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
			for (let i of comments) {
				if (i.commentId === Number(commentId)) {
					i.content = ctx.request.body.data.content //axios의 data
					i.publishedDate = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
					i.updated = true
				}
			}
			const updated = await Post.findOneAndUpdate(
				{ postId: postId },
				{
					comments: comments,
				},
				{ new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
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
			comments = comments.filter((i) => i.commentId !== Number(commentId))
			const updated = await Post.findOneAndUpdate(
				{ postId: postId },
				{
					comments: comments,
				},
				{ new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
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
