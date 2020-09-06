require('dotenv').config()
const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')
const jwtMiddleware = require('./lib/jwtMiddleware')

const posts = require('./posts')
const auth = require('./auth')

const {PORT, MONGO_URI} = process.env

//mongoDB 연결

mongoose
    .set('returnOriginal', false)
    .connect(MONGO_URI,{useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true})
    .then(() => {console.log('Connected to MongoDB')})
    .catch(e => {console.error(e)})

const app = new Koa()
const router = new Router()

//라우터 설정
router.get('/', (ctx) => {
    ctx.body = `Hello, blog_imki123_backend

post: post(/posts/)
list: get(/posts/)
tag list: get(/posts/:tags)
read: get(/posts/id/:postId)
delete: delete(/posts/:postId)
update: patch(/posts/:postId)

register: post(/auth/register/)
login: post(/auth/login)

Thanks :D
`
})

router.use('/posts', posts.routes()) //posts 라우트 적용
router.use('/auth', auth.routes()) //auth 라우트 적용

//cors 정책 적용
const whitelist = ['http://localhost:3000','https://imki123.github.io'];
function checkOriginAgainstWhitelist(ctx) { //https://madole.xyz/whitelisting-multiple-domains-with-kcors-in-koa
    const requestOrigin = ctx.accept.headers.origin;
    if (!whitelist.includes(requestOrigin)) {
        return ctx.throw(`🙈 ${requestOrigin} is not a valid origin`);
    }
    return requestOrigin;
 }
app.use(cors({
    origin: checkOriginAgainstWhitelist, 
    exposeHeaders: ['Total-Post','Last-Page', 'Set-Cookie', 'access_token'],
    credentials: true,
}))

//body-parser 사용
app.use(bodyParser())
//jwtMiddleware 적용
app.use(jwtMiddleware)

//app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods())

const port = PORT || 4000

app.listen(port, () => {
	console.log(`Listening on port: ${port}\nConnect to http://localhost:${port}`)
})


//heroku sleep 방지
const http = require("http");
setInterval(function () {
    http.get("http://blog-imki123-backend.herokuapp.com");
}, 600000);
