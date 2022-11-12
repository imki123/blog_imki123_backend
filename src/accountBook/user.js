import Router from 'koa-router'
import { cookieOptions } from '../auth/index.js'
import setCookieSecureFalse from '../lib/setCookieSecureFalse.js'
import { AccountBookUser } from '../Model/AccountBookUser.js'

export const routerUser = new Router()

// /accountBook/user/
// 이메일 체크하고 쿠키저장, FE에 토큰보내기. 로그인
routerUser.post('/checkEmail', async (ctx) => {
  const { username, email } = ctx.request.body // username, email
  const user = new AccountBookUser({ username: username, email: email })
  try {
    // 이메일 체크
    console.log('/checkEmail. 로그인:', user)
    if (user.checkEmail(email)) {
      const token = user.generateToken()

      //http통신이면 secure: false로 변경
      const options = setCookieSecureFalse(cookieOptions, ctx)

      ctx.body = { token: token, username: user.username } // jwt 토큰 FE에 보내기
      ctx.cookies.set('account_book_access_token', token, options)
    } else {
      ctx.throw(403, e)
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})

// 토큰 이메일 체크 (300일 이하면 미들웨어에서 토큰 재발급)
routerUser.post('/checkToken', async (ctx) => {
  console.log(ctx.state.user)
  try {
    if (ctx.state.user) ctx.body = ctx.cookies.get('account_book_access_token')
    else {
      console.error('/checkToken: No Token!!')
      ctx.body = false
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})

// 로그아웃 BE쿠키 제거
routerUser.post('/logout', async (ctx) => {
  try {
    if (ctx.state.user) {
      console.log('Logout!', ctx.state.user.email)

      //http통신이면 secure: false로 변경
      const options = setCookieSecureFalse(cookieOptions, ctx)
      ctx.cookies.set('account_book_access_token', '', options)
      ctx.body = true
    } else {
      console.log('Logout Fail!')
      ctx.throw(403)
    }
  } catch (e) {
    console.log('Logout Fail!')
    ctx.throw(500, e)
  }
})

// 유저 정보 가져오기
routerUser.get('/', async (ctx) => {
  try {
    if (ctx.state.user) {
      ctx.body = JSON.stringify(ctx.state.user)
    } else ctx.throw(403)
  } catch (e) {
    ctx.throw(500, e)
  }
})
