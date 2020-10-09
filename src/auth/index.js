const Router = require('koa-router')
const User = require('../models/user')
const Post = require('../models/post')
const setCookieSecureFalse = require('../lib/setCookieSecureFalse')

const Joi = require('joi')
const router = new Router()

/* auth 종류 : 
	getUserInfo: post(/auth/user)
    register: post(/auth/register/)
	login: post(/auth/login)
	OAuth: post(/auth/oauth)
    check: get(/auth/check)
	logout: post(/auth/logout)

	merge: post(/auth/merge)
*/

let cookieOptions = {
	maxAge: 1000 * 60 * 60 * 24 * 7, //7일
	secure: true, //CORS
	sameSite: 'none', //CORS
	overwrite: true,
	httpOnly: true,
}

// 라우터 설정
// getUserInfo: post(/auth/user)
router.post('/user', async (ctx) => {
	const { username } = ctx.request.body.data
	console.log(username)
	try {
		const user = await User.findOne({ username: username })
		if (!user) {
			ctx.status = 204
			ctx.body = 'No '+username
			return
		}
		ctx.body = user.serialize()
	} catch (e) {
		ctx.throw(500, e)
	}
})

// 유저 등록 register: post(/auth/register/)
router.post('/register', async (ctx) => {
	const schema = Joi.object().keys({
		//객체가 다음 필드를 가지고 있음을 검증
		username: Joi.string().min(3).max(20).required(), //required가 있으면 필수항목
		password: Joi.string().required(),
	})
	const result = schema.validate(ctx.request.body)
	if (result.error) {
		ctx.status = 400 //Bad Request
		ctx.body = result.error
		return
	}

	const { username, password } = ctx.request.body
	try {
		const exists = await User.findByUsername(username) //유저 중복검사. 인스턴스메서드
		if (exists) {
			//이미 유저네임이 있으면 중복
			ctx.status = 409 //Conflict
			return
		}

		const user = new User({
			username,
		})
		await user.setPassword(password) //비밀번호 설정. 인스턴스메서드
		await user.save()

		ctx.body = user.serialize()

		//토큰 발급
		const token = user.generateToken()

		//http통신이면 secure: false로 변경
		cookieOptions = setCookieSecureFalse(cookieOptions, ctx)

		ctx.cookies.set('access_token', token, cookieOptions)
	} catch (e) {
		ctx.throw(500, e)
	}
})
//로그인 login: post(/auth/login)
router.post('/login', async (ctx) => {
	const { username, password } = ctx.request.body
	if (!username || !password) {
		console.log('No username or password')
		ctx.status = 401 //Unauthorized
		return
	}

	try {
		const user = await User.findByUsername(username)
		if (!user) {
			ctx.status = 401
			return
		}
		const valid = await user.checkPassword(password)
		if (!valid) {
			ctx.status = 401
			return
		}
		ctx.body = user.serialize()

		//토큰 발급
		const token = user.generateToken()

		//http통신이면 secure: false로 변경
		cookieOptions = setCookieSecureFalse(cookieOptions, ctx)

		ctx.cookies.set('access_token', token, cookieOptions)
	} catch (e) {
		ctx.throw(500, e)
	}
})
//OAuth: post(/auth/oauth)
router.post('/oauth', async (ctx) => {
	const { username, email, imageUrl } = ctx.request.body
	let user
	try {
		//OAuth로 로그인할 경우 유저정보를 DB에 저장해둠(프로필 이미지 최신화 때문에)
		const search = await User.findOne({ username: username })
		if (search) {
			user = await User.findOneAndUpdate(
				{ username: username },
				{
					username: username,
					email: email,
					imageUrl: imageUrl,
					oAuth: true,
				},
				{ new: true },
			)
		} else {
			user = new User({
				username: username,
				email: email,
				imageUrl: imageUrl,
				oAuth: true,
			})

			user.save()
		}
		//console.log(user)
		//토큰 발급
		const token = user.generateToken()

		//http통신이면 secure: false로 변경
		cookieOptions = setCookieSecureFalse(cookieOptions, ctx)

		ctx.cookies.set('access_token', token, cookieOptions)
		ctx.body = user.serialize()
	} catch (e) {
		ctx.throw(500, e)
	}
})

//check: get(/auth/check)
router.get('/check', async (ctx) => {
	const { user } = ctx.state

	if (!user) {
		//로그인 중 아님
		ctx.status = 204 //No Content
		return
	}
	ctx.body = user
})
//logout: post(/auth/logout)
router.post('/logout', async (ctx) => {
	//http통신이면 secure: false로 변경
	cookieOptions = setCookieSecureFalse(cookieOptions, ctx)

	ctx.cookies.set('access_token', '', cookieOptions) //회원정보 쿠키
	ctx.cookies.set('G_AUTHUSER_H', '', cookieOptions) //구글로그인 쿠키
	ctx.status = 204 //No Content
})
//withdraw: delete(/auth/withdraw) 회원탈퇴
router.delete('/withdraw', async (ctx) => {
	const { username, password } = ctx.request.body
	if (!username || !password) {
		console.log('No username or password')
		ctx.status = 401 //Unauthorized
		return
	}

	try {
		//아이디 검사, 유저 다큐먼트 생성
		const user = await User.findByUsername(username)
		if (!user) {
			console.log('No Username')
			ctx.status = 204
			return
		}
		//비밀번호 검사
		const valid = await user.checkPassword(password)
		if (!valid) {
			ctx.status = 401
			return
		}
		//아이디 삭제
		user.deleteByUsername(username)

		//http통신이면 secure: false로 변경
		cookieOptions = setCookieSecureFalse(cookieOptions, ctx)

		//토큰 삭제
		ctx.cookies.set('access_token', '', cookieOptions)
		ctx.status = 200 //No Content
	} catch (e) {
		ctx.throw(500, e)
	}
})
//merge: post(/auth/merge)
router.post('/merge', async (ctx) => {
	const { username, mergedUsername } = ctx.request.body
	if (!username || !mergedUsername) {
		ctx.state = 401
		return
	}

	try {
		const user = await User.findOne({ username: username })
		console.log(user)
		if (user) {
			//유저정보가 있으면 전부다 바꾸고
			await User.findOneAndUpdate({ username: mergedUsername }, user)
		} else {
			//유저정보가 없으면 이름만 바꿈
			await User.findOneAndUpdate({ username: mergedUsername }, { username: username })
		}
		const posts = await Post.find()
		let totalCnt = 0
		for (let i of posts) {
			let comments = []
			let cnt = 0
			for (let j of i.comments) {
				let comment = j
				if (j.username === mergedUsername) {
					comment.username = username
					cnt++
				}
				comments.push(comment)
			}
			totalCnt += cnt
			console.log(comments)
			//await Post.findOneAndUpdate({ postId: i.postId }, { comments: comments })
		}
		ctx.body = totalCnt
	} catch (e) {
		ctx.throw(500, e)
	}
})

module.exports = router
