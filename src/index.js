require('dotenv').config()
const Koa = require('koa')
const Router = require('koa-router')
const posts = require('./posts')
const mongoose = require('mongoose')
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')

const {PORT, MONGO_URI} = process.env

//heroku sleep 방지
const http = require("http");
setInterval(function () {
    http.get("http://log-imki123-backend.herokuapp.com");
}, 600000);


//mongoDB 연결
mongoose.connect(MONGO_URI,{useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true})
    .then(() => {console.log('Connected to MongoDB')})
    .catch(e => {console.error(e)})

const app = new Koa()
const router = new Router()

//라우터 설정
router.get('/', (ctx) => {
    ctx.body = `Hello, blog_imki123_backend

post: post(/posts/)
list: get(/posts/)
tag list: get(/posts/tag)
read: get(/posts/id)
delete: delete(/posts/id)
update: patch(/posts/id)

Thanks :D
`
})
router.use('/posts', posts.routes()) //posts 라우트 적용

//cors 정책 적용
const whitelist = ['http://localhost:3000','https://imki123.github.io'];
function checkOriginAgainstWhitelist(ctx) { //https://madole.xyz/whitelisting-multiple-domains-with-kcors-in-koa
    const requestOrigin = ctx.accept.headers.origin;
    if (!whitelist.includes(requestOrigin)) {
        return ctx.throw(`🙈 ${requestOrigin} is not a valid origin`);
    }
    return requestOrigin;
 }
app.use(cors({origin: checkOriginAgainstWhitelist}))

//body-parser 사용
app.use(bodyParser())

//app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods())

const port = PORT || 4000

app.listen(port, () => {
	console.log(`Listening on port: ${port}\nConnect to http://localhost:${port}`)
})
