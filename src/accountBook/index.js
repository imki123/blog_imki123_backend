const Router = require('koa-router')
const router = new Router()
const { default: Axios } = require('axios')
const Sheet = require('../models/Sheet')
const { Translate } = require('@google-cloud/translate').v2

/**
 * accountBook에서 사용하는 api
 * get(/sheet) : { (sheetId: number, name: string)[] }
 * get(/sheet/:sheetId) : {
 *   sheetId: number,
 *   name: string,
 *   data: (string | number)[][]
 * }
 * */

// 라우터 설정

router.get('/sheet', async (ctx) => {
  const sheet = await Sheet.find().sort({ sheetId: 1 })
  if (sheet) ctx.body = sheet
  else ctx.status = 204 //No Content
})

module.exports = router
