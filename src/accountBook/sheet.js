import Router from 'koa-router'
export const routerSheet = new Router()
import { Sheet } from '../Model/Sheet.js'

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
routerSheet.get('/', async (ctx) => {
  try {
    const sheet = await Sheet.find().sort({ sheetId: 1 })
    if (sheet) ctx.body = sheet
    else ctx.status = 204 //No Content
  } catch (e) {
    ctx.throw(500, e)
  }
})

// sheetId로 불러오기
routerSheet.get('/:sheetId', async (ctx) => {
  try {
    const { sheetId } = ctx.params
    const sheet = await Sheet.findOne({ sheetId: sheetId })
    if (sheet) ctx.body = sheet
    else ctx.status = 204 //No Content
  } catch (e) {
    ctx.throw(500, e)
  }
})

// sheet 추가
routerSheet.post('/', async (ctx) => {
  try {
    //sheetId 생성
    let sheetId = 1
    const sheets = await Sheet.find().exec()
    if (sheets.length > 0) {
      sheetId = sheets[sheets.length - 1].sheetId + 1
    }
    const sheet = new Sheet({
      sheetId: sheetId,
      name: 'Sheet' + sheetId,
      table: [],
    })
    await sheet.save()
    ctx.body = sheet
  } catch (e) {
    ctx.throw(500, e)
  }
})

// sheet 업데이트
routerSheet.patch('/:sheetId', async (ctx) => {
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
