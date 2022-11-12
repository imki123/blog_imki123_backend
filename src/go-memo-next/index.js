import Router from 'koa-router'
import { routerUser } from './user.js'
export const goMemoNextRouter = new Router()

// 하위 라우터 등록
goMemoNextRouter.use('/user', routerUser.routes()) // /go-memo-next/user/
