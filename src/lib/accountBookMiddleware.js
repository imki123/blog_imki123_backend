import jwt from 'jsonwebtoken'
import { User } from '../Model/User.js'
import setCookieSecureFalse from './setCookieSecureFalse.js'

let cookieOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 7, //7일
  secure: true, //CORS
  sameSite: 'none', //CORS
  overwrite: true,
  httpOnly: true,
}

export const accountBookMiddleware = async (ctx, next) => {
  // 액세스 토큰 있는지 체크
  console.log('')
  const token = ctx.cookies.get('accountBook_access_token')
  if (token === undefined || token === '') {
    console.log('accountBookMiddleware pass: no token')
    return next() //액세스 토큰이 없으면 미들웨어 패스
  }

  // http통신이면 secure: false로 변경
  cookieOptions = setCookieSecureFalse(cookieOptions, ctx)

  try {
    // 토큰을 시크릿키로 디코드해서 ctx.state.user에 저장
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    ctx.state.user = {
      username: decoded.username,
      email: decoded.email,
    }

    //토큰의 남은 유효 기간이 3.5일 미만이면 재발급
    const now = Math.floor(
      new Date(new Date().getTime() + 9 * 60 * 60 * 1000) / 1000,
    )
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id)
      //토큰 재발급
      const token = user.generateToken()
      ctx.cookies.set('access_token', token, cookieOptions)
    }

    console.log('[JWT] success:', decoded.username, decoded.email)
    return next()
  } catch (e) {
    //토큰 검증 실패
    console.log('[JWT] fail:', e)
    return next()
  }
}