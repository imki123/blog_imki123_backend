const Router = require('koa-router')
const router = new Router()
const Sheet = require('../Model/Sheet')

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

// sheet 목록 전체 불러오기
router.get('/sheet/', async (ctx) => {
  try {
    const sheet = await Sheet.find()
    console.log(sheet)
    if (sheet) ctx.body = sheet
    else ctx.status = 204 //No Content
  } catch (e) {
    ctx.throw(500, e)
  }
})

// sheetId로 불러오기
router.get('/sheet/:sheetId', async (ctx) => {
  try {
    const { sheetId } = ctx.params
    const sheet = await Sheet.findOne({ sheetId: sheetId })
    console.log(sheet)
    if (sheet) ctx.body = sheet
    else ctx.status = 204 //No Content
  } catch (e) {
    ctx.throw(500, e)
  }
})

// sheet 업데이트
router.patch('/sheet/:sheetId', async (ctx) => {
  const { sheetId } = ctx.params
  try {
    // sheetId로 찾고 업데이트
    const updated = await Sheet.findOneAndUpdate(
      { sheetId: sheetId },
      {
        ...ctx.request.body,
      },
      { new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
    )
    if (updated) {
      ctx.body = updated
    } else {
      ctx.status = 204 //No content
      return
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})

module.exports = router
