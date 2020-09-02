require('dotenv').config()
const Koa = require('koa')
const Router = require('koa-router')
const posts = require('./posts')
const mongoose = require('mongoose')
const bodyParser = require('koa-bodyparser')

const {PORT, MONGO_URI} = process.env

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
read: get(/posts/id)
delete: delete(/posts/id)
update: patch(/posts/id)

Thanks :D
`
})
router.use('/posts', posts.routes()) //posts 라우트 적용

//body-parser 사용
app.use(bodyParser())

//app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods())

const port = PORT || 4000

app.listen(port, () => {
	console.log(`Connect to http://localhost:${port}`)
})
