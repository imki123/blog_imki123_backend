import Router from 'koa-router'
import { cookieOptions } from '../auth/index.js'
import setCookieSecureFalse from '../lib/setCookieSecureFalse.js'
import { AccountBookUser } from '../Model/AccountBookUser.js'

export const routerUser = new Router()

// 이메일 체크하고 쿠키저장, FE에 토큰보내기
routerUser.post('/checkEmail', async (ctx) => {
  const { username, email } = ctx.request.body // username, email
  const User = new AccountBookUser({ username: username, email: email })
  try {
    // 이메일 체크
    if (User.checkEmail(email)) {
      const token = User.generateToken()

      //http통신이면 secure: false로 변경
      const options = setCookieSecureFalse(cookieOptions, ctx)

      ctx.body = token // jwt 토큰 FE에 보내기
      ctx.cookies.set('accountBook_access_token', token, options)
    } else {
      ctx.throw(403, e)
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})

// 토큰 이메일 체크 (3.5일 이하면 미들웨어에서 토큰 재발급)
routerUser.post('/checkToken', async (ctx) => {
  try {
    if (ctx.state.user) ctx.body = ctx.cookies.get('accountBook_access_token')
    else ctx.throw(403)
  } catch (e) {
    ctx.throw(500, e)
  }
})
