//http통신이면 secure: false로 변경
function setCookieSecureFalse(cookieOptions, ctx){
	if(ctx.request && ctx.request.protocol !== 'https'){
		cookieOptions = {
			...cookieOptions,
			secure: false
		}
		console.log('cookie.secure is changed false. ctx.request.protocoll is http.')
	}
	return cookieOptions
}

module.exports = setCookieSecureFalse