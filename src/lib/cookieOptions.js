export const cookieOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 365, //365일
  secure: true, //CORS
  sameSite: 'none', //CORS
}

//http통신이면 secure: false로 변경
export function setCookieOptionsByProtocol(ctx, options) {
  let newOptions = options || cookieOptions
  if (ctx.request && ctx.request.protocol !== 'https') {
    newOptions = {
      ...newOptions,
      secure: false,
      sameSite: 'Lax',
    }
    // console.log(
    //   '-- ctx.request.protocoll is http. cookie.secure = false, cookie.sameSite = Lax. ',
    // )
  }
  return newOptions
}
