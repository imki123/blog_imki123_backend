const jwt = require('jsonwebtoken')
const User = require('../models/user')
const setCookieSecureFalse = require('./setCookieSecureFalse')

let cookieOptions = {
	maxAge: 1000 * 60 * 60 * 24 * 7, //7일
	secure: true, //CORS
	sameSite: 'none', //CORS
	overwrite: true,
	httpOnly: true,
}

const jwtMiddleware = async (ctx, next) => {
	//토큰 있는지 체크
	const token = ctx.cookies.get('access_token')
	if (token === undefined || token === ''){
		return next() //토큰이 없음
	}
	

	//http통신이면 secure: false로 변경
	cookieOptions = setCookieSecureFalse(cookieOptions, ctx)
	
	try { //토큰을 디코드해서 state.user에 저장
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		
		//일반 로그인: 토큰은 있으나 DB에 아이디가 없으면 state와 cookies를 제거함
		if(!decoded.oAuth){
			const user = await User.findByUsername(decoded.username)
			if(!user){ 
				console.log('일반 로그인인데 DB에 아이디가 없어서 로그아웃')
				ctx.status = 204 //No content 
				ctx.cookies.set('access_token', '', cookieOptions)
				ctx.state.user = null
				return next()
			}
		}
		
		ctx.state.user = {
			_id: decoded._id,
			username: decoded.username,
			email: decoded.email,
			imageUrl: decoded.imageUrl,
			oAuth: decoded.oAuth,
		}
		
		//토큰의 남은 유효 기간이 3.5일 미만이면 재발급
		const now = Math.floor(new Date((new Date()).getTime() + 9*60*60*1000) / 1000)
		if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
			const user = await User.findById(decoded._id)
			//토큰 재발급
			const token = user.generateToken()
			ctx.cookies.set('access_token', token, cookieOptions)
		}

		console.log('[JWT]',decoded.username, decoded.email)
		return next()
	} catch (e) {
		//토큰 검증 실패
		console.log('[JWT] fail:', e)
		return next()
	}
}
module.exports = jwtMiddleware
