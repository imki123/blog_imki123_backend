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
    const sheet = await Sheet.find().sort({ order: 1 })
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
    let order = 1
    const sheets = await Sheet.find().sort({ sheetId: 1 })
    if (sheets.length > 0) {
      sheetId = sheets[sheets.length - 1].sheetId + 1
      order = sheets.length + 1
    }
    const sheet = new Sheet({
      sheetId: sheetId,
      name: 'Sheet' + sheetId,
      order: order,
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
// sheet 순서 변경 {fromId, toId}
routerSheet.patch('/:fromId/:toId', async (ctx) => {
  const { fromId, toId } = ctx.params
  try {
    // sheetId로 찾고 업데이트
    const fromSheet = await Sheet.findOne({ sheetId: fromId })
    const toSheet = await Sheet.findOne({ sheetId: toId })
    const fromOrder = fromSheet.order
    const toOrder = toSheet.order

    const fromSheetResult = await Sheet.findOneAndUpdate(
      { sheetId: fromId },
      {
        order: toOrder,
      },
      { new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
    )
    const toSheetResult = await Sheet.findOneAndUpdate(
      { sheetId: toId },
      {
        order: fromOrder,
      },
      { new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
    )
    if (fromSheet && toSheet) {
      ctx.body = [fromSheet, toSheet]
    } else {
      ctx.status = 204 //No content
      return
    }
    return
  } catch (e) {
    ctx.throw(500, e)
  }
})
// sheet 삭제
routerSheet.delete('/:sheetId', async (ctx) => {
  const { sheetId } = ctx.params
  try {
    // sheetId로 찾고 업데이트
    const deleted = await Sheet.findOneAndDelete({ sheetId: sheetId })
    if (deleted) {
      ctx.body = deleted
    } else {
      ctx.status = 204 //No content
      return
    }
    return
  } catch (e) {
    ctx.throw(500, e)
  }
})
