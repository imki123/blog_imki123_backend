const Router = require('koa-router')
const Post = require('../models/post')
const router = new Router()

/* posts 종류 : 
    post: post(/posts/)
    list: get(/posts/)
    read: get(/posts/id)
    delete: delete(/posts/id)
    update: patch(/posts/id)
*/
// 라우터 설정

//포스트 작성 post
router.post('/', async (ctx) => {
	let postId = 1
	const posts = await Post.find().exec()
	if (posts.length > 0) {
		postId = posts[posts.length - 1].postId + 1
	}
	const { title, body, tags } = ctx.request.body
	const post = new Post({
		postId,
		title,
		body,
		tags,
	})
	try {
		await post.save()
		ctx.body = post
	} catch (e) {
		ctx.throw(500, e)
	}
})
//포스트 전체 목록 list
router.get('/', async (ctx) => {
	try {
		const posts = await Post.find().sort({ publishedDate: -1 })
		ctx.body = posts
	} catch (e) {
		ctx.throw(500, e)
	}
})
//특정 태그 포스트 목록 list
router.get('/:tag', async (ctx) => {
	const page = parseInt(ctx.query.page || '1', 10) //페이지를 숫자로 변환. 없다면 1
	if (page < 1) {
		ctx.status = 400
		return
	}

	try {
		const { tag } = ctx.params
		const post = await Post.find({ tags: tag })
			.sort({ publishedDate: -1 }) //역순
			.limit(5) //5건씩 불러옴
			.skip((page - 1) * 5) //5건마다 페이지 스킵
        const postCount = await Post.countDocuments({ tags: tag }) //전체 페이지 수를 헤더에 저장
        ctx.set('Total-post', postCount)
		ctx.set('Last-Page', Math.ceil(postCount / 5))
		if (post) {
			ctx.body = post
		} else {
			ctx.status = 404 //Not found
			return
		}
	} catch (e) {
		ctx.throw(500, e)
	}
})
//특정 포스트 조회 read
router.get('/:postId', async (ctx) => {
	try {
		const { postId } = ctx.params
		const post = await Post.findOne({ postId: postId })
		if (post) {
			ctx.body = post
		} else {
			ctx.status = 404 //Not found
			return
		}
	} catch (e) {
		ctx.throw(500, e)
	}
})
//특정 포스트 삭제 delete
router.delete('/:postId', async (ctx) => {
	try {
		const { postId } = ctx.params
		const post = await Post.findOneAndRemove({ postId: postId })
		if (post) {
			ctx.body = `${post} was deleted.`
		} else {
			ctx.status = 204 //No content
			return
		}
	} catch (e) {
		ctx.throw(500, e)
	}
})
//특정 포스트 수정 update
router.patch('/:postId', async (ctx) => {
	try {
		const { postId } = ctx.params
		const post = await Post.findOneAndUpdate(
			{ postId: postId },
			ctx.request.body,
			{
				new: true, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
			},
		)
		if (post) {
			ctx.body = `${post} was updated.`
		} else {
			ctx.status = 204 //No content
			return
		}
	} catch (e) {
		ctx.throw(500, e)
	}
})

module.exports = router
