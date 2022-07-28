const Router = require('koa-router')
const router = new Router()
const Sheet = require('../models/Sheet')

/**
 * accountBook에서 사용하는 api
 * get(/accountBook/sheet/) : { (sheetId: number, name: string)[] }
 * get(/accountBook/sheet/:sheetId) : {
 *   sheetId: number,
 *   name: string,
 *   data: (string | number)[][]
 * }
 * */

// 라우터 설정

router.get('/sheet/', async (ctx) => {
  try {
    const sheet = await Sheet.find()
    console.log(sheet)
    console.log(Sheet)
    if (sheet) ctx.body = sheet
    else ctx.status = 204 //No Content
  } catch (e) {
    ctx.throw(500, e)
  }
})

module.exports = router
