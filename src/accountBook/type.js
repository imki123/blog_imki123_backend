import Router from 'koa-router'
import { Type } from '../Model/Type.js'
export const routerType = new Router()

// 라우터 설정
// /accountBook/type/

// type 불러오기
routerType.get('/', async (ctx) => {
  try {
    const types = await Type.findOne({ typeId: 1 })
    if (types) ctx.body = types
    else ctx.status = 204 //No Content
  } catch (e) {
    ctx.throw(500, e)
  }
})

// type 변경하기
routerType.patch('/', async (ctx) => {
  try {
    // typeId로 찾고 업데이트
    const updated = await Type.findOneAndUpdate(
      { typeId: 1 },
      {
        types: ctx.request.body,
      },
      { new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
    )
    if (updated) {
      ctx.body = true
    } else {
      ctx.status = 204 //No content
      return
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})
