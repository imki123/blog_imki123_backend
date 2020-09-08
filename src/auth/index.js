const Router = require('koa-router')
const User = require('../models/user')
const Joi = require('joi')
const router = new Router()

/* auth 종류 : 
    register: post(/auth/register/)
    login: post(/auth/login)
    check: get(/auth/check)
    logout: post(/auth/logout)
*/
// 라우터 설정

//유저 등록 register: post(/auth/register/)

let cookieOptions = {
	maxAge: 1000*60*60*24*7, //7일
	secure: true, //CORS
	sameSite: 'none', //CORS
	overwrite: true,
};

//http통신이면 secure: false로 변경
function setCookieSecureFalse(cookieOptions, ctx){
	if(ctx.request.protocol !== 'https'){
		cookieOptions = {
			...cookieOptions,
			secure: false
		}
	}
}

router.post('/register', async (ctx) => {
    const schema = Joi.object().keys({
		//객체가 다음 필드를 가지고 있음을 검증
        username: Joi.string().alphanum().min(3).max(20).required(), //required가 있으면 필수항목
		password: Joi.string().required(),
	})
	const result = schema.validate(ctx.request.body)
	if(result.error){
		ctx.status = 400 //Bad Request
		ctx.body = result.error
		return
    }

    const {username, password} = ctx.request.body
	try {
        const exists = await User.findByUsername(username) //유저 중복검사. 인스턴스메서드
        if(exists){ //이미 유저네임이 있으면 중복
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
		setCookieSecureFalse(cookieOptions, ctx)

		ctx.cookies.set('access_token', token, cookieOptions)
	} catch (e) {
		ctx.throw(500, e)
	}
})
//로그인 login: post(/auth/login)
router.post('/login', async (ctx) => {
	const {username, password} = ctx.request.body
	if(!username || !password){
		console.log('No username or password')
		ctx.status = 401 //Unauthorized
		return
	}

	try {
		const user = await User.findByUsername(username)
		if(!user){
			ctx.status = 401
			return
		}
		const valid = await user.checkPassword(password)
		if(!valid){
			ctx.status = 401
			return
		}
		ctx.body = user.serialize()

		//토큰 발급
		const token = user.generateToken()

		//http통신이면 secure: false로 변경
		setCookieSecureFalse(cookieOptions, ctx)

		ctx.cookies.set('access_token', token, cookieOptions)
		
	} catch (e) {
		ctx.throw(500, e)
	}
})
//check: get(/auth/check)
router.get('/check', async (ctx) => {
	const {user} = ctx.state
	if(!user){ //로그인 중 아님
		ctx.status = 204 //No Content
		return
	}
	ctx.body = user
})
//logout: post(/auth/logout)
router.post('/logout', async (ctx) => {
	//http통신이면 secure: false로 변경
	setCookieSecureFalse(cookieOptions, ctx)

	ctx.cookies.set('access_token','',cookieOptions)
	ctx.status = 204 //No Content
})
//withdraw: delete(/auth/withdraw) 회원탈퇴
router.delete('/withdraw', async (ctx) => {
    const {username, password} = ctx.request.body
	if(!username || !password){
		console.log('No username or password')
		ctx.status = 401 //Unauthorized
		return
	}

	try {
		//아이디 검사, 유저 다큐먼트 생성
		const user = await User.findByUsername(username)
		if(!user){
			console.log('No Username')
			ctx.status = 204
			return
		}
		//비밀번호 검사
		const valid = await user.checkPassword(password)
		if(!valid){
			ctx.status = 401
			return
		}
		//아이디 삭제
		user.deleteByUsername(username)

		//http통신이면 secure: false로 변경
		setCookieSecureFalse(cookieOptions, ctx)

		//토큰 삭제
		ctx.cookies.set('access_token','',cookieOptions)
		ctx.status = 200 //No Content
		
	} catch (e) {
		ctx.throw(500, e)
	}
})

module.exports = router