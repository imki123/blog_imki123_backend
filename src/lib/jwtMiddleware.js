const jwt = require('jsonwebtoken')
const User = require('../models/user')

const cookieOptions = {
	maxAge: 1000 * 60 * 60 * 24 * 7, //7일
	secure: true, //CORS
	sameSite: 'none', //CORS
	overwrite: true,
}

const jwtMiddleware = async (ctx, next) => {
	const token = ctx.cookies.get('access_token')
	if (!token) {
		console.log('NO TOKEN')
		return next() //토큰이 없음
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		ctx.state.user = {
			_id: decoded._id,
			username: decoded.username,
		}
		//토큰의 남은 유효 기간이 3.5일 미만이면 재발급
		const now = Math.floor(Date.now() / 1000)
		if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
			const user = await User.findById(decoded._id)
			//토큰 발급
			const token = user.generateToken()
			ctx.cookies.set('access_token', token, cookieOptions)
		}

		console.log(decoded)
		return next()
	} catch (e) {
		//토큰 검증 실패
		console.log('jwt verify fail:', e)
		return next()
	}
}
module.exports = jwtMiddleware
