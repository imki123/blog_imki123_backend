import Router from 'koa-router'
import { routerSheet } from './sheet.js'
import { routerType } from './type.js'
import { routerUser } from './user.js'
export const routerAccountBook = new Router()

// 하위 라우터 등록
routerAccountBook.use('/sheet', routerSheet.routes()) // /accountBook/sheet/
routerAccountBook.use('/user', routerUser.routes()) // /accountBook/user/
routerAccountBook.use('/type', routerType.routes()) // /accountBook/type/
