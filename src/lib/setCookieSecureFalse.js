//http통신이면 secure: false로 변경
function setCookieSecureFalse(cookieOptions, ctx){
	if(ctx.request && ctx.request.protocol !== 'https'){
		cookieOptions = {
			...cookieOptions,
			secure: false,
			sameSite: "Lax"
		}
		console.log('-- ctx.request.protocoll is http. cookie.secure = false, cookie.sameSite = Lax. ')
	}
	return cookieOptions
}

module.exports = setCookieSecureFalse