import { config } from 'dotenv'
import Koa from 'koa'
import Router from 'koa-router'
import mongoose from 'mongoose'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import http from 'http'
import { routerPosts } from './posts/index.js'
import { routerAuth } from './auth/index.js'
import { routerComments } from './comments/index.js'
import { routerMenus } from './menus/index.js'
import { routerCatbook } from './catbook/index.js'
import { routerAccountBook } from './accountBook/index.js'
import { jwtMiddleware } from './lib/jwtMiddleware.js'

config()

const { PORT, MONGO_URI } = process.env

//mongoDB 연결
mongoose
  .set('returnOriginal', false)
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB.')
  })
  .catch((e) => {
    console.error('Cannot connect to MongoDB. Check MONGO_URI.', e)
  })

const app = new Koa()
app.proxy = true
const router = new Router()

//라우터 설정
router.get('/', (ctx) => {
  ctx.body = `Hello, blog_imki123_backend

  post: post(/posts/)
  list: get(/posts/)
  menus: get(/posts/menus)
  tag list: get(/posts/:tags)
  read: get(/posts/id/:postId)
  delete: delete(/posts/:postId)
  update: patch(/posts/:postId)

  register: post(/auth/register/)
  login: post(/auth/login)
  check: get(/auth/check)
  logout: post(/auth/logout)


  get: get(/comments/:postId)
  post: patch(/comments/:postId)
  update: patch(/comments/:postId/:commentId)
  delete: delete(/comments/:postId/:commentId)

  - accountBook
  get(/accountBook/sheet/)
  get(/accountBook/sheet/sheetId)

  Thanks :D
`
})

router.use('/posts', routerPosts.routes()) //posts 라우트 적용
router.use('/auth', routerAuth.routes()) //auth 라우트 적용
router.use('/comments', routerComments.routes()) //comments 라우트 적용
router.use('/menus', routerMenus.routes()) //menus 라우트 적용
router.use('/catbook', routerCatbook.routes()) //catbook 라우트 적용
router.use('/accountBook', routerAccountBook.routes()) //accountBook 라우트 적용

//cors 정책 적용
const whitelist = [
  'http://localhost:3000',
  'http://localhost:4001', // account-book
  'https://imki123.github.io',
  'http://localhost:19006',
  'http://localhost:45678',
  'http://192.168.0.4:3000',
]
function checkOriginAgainstWhitelist(ctx) {
  //https://madole.xyz/whitelisting-multiple-domains-with-kcors-in-koa
  const requestOrigin = ctx.accept.headers.origin
  if (!whitelist.includes(requestOrigin)) {
    return ctx.throw(`🙈 ${requestOrigin} is not a valid origin`)
  }
  return requestOrigin
}
app.use(
  cors({
    origin: checkOriginAgainstWhitelist,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: [
      'Origin',
      'Access-Control-Request-Method',
      'X-Requested-With',
      'X-HTTP-Method-Override',
      'Content-Type',
      'Accept',
      'Set-Cookie',
    ],
    credentials: true,
  }),
)

//body-parser 사용
app.use(
  bodyParser({
    jsonLimit: '10mb', //default: 1mb
  }),
)
//jwtMiddleware 적용
app.use(jwtMiddleware)

//app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods())

const port = PORT || 4000

app.listen(port, () => {
  console.log(`Listening on port: ${port}\nConnect to http://localhost:${port}`)
})

//heroku sleep 방지

setInterval(function () {
  http.get('http://blog-imki123-backend.herokuapp.com')
}, 600000) //10분
