import Router from 'koa-router'
import Axios from 'axios'
import Translate from '@google-cloud/translate'

export const routerCatbook = new Router()
/* catbook에서 사용하는 api
catbook 종류 : 
    getAnimal: get(/catbook/getAnimal/:animal/:breed)
    translate: get(/catbook/translate/:locale/:text)
*/

// 라우터 설정
// getAnimal: get(/catbook/getAnimal/:animal/:breed)
routerCatbook.get('/getAnimal/:animal/:breed', async (ctx) => {
  const { animal, breed } = ctx.params
  let url = 'https://api.thecatapi.com/v1/images/search?breed_ids=' + breed
  if (animal !== 'cat')
    url = 'https://api.thedogapi.com/v1/images/search?breed_ids=' + breed

  await Axios(url, {
    headers: { 'x-api-key': process.env.CAT_API_KEY }, //cat-api
  })
    .then((res) => {
      console.log(res.data)
      ctx.body = res.data
    })
    .catch((e) => console.log(e))
})
// translate: get(/catbook/translate/:locale/:text)
routerCatbook.get('/translate/:locale/:text', async (ctx) => {
  //번역기 key 설정
  const key = process.env.GOOGLE_API_KEY
  const translate = new Translate.v2({ key })

  // 해당 언어로번역하기
  const { locale, text } = ctx.params
  await translate
    .translate(text, locale)
    .then((res) => {
      console.log(res[0])
      ctx.body = res[0]
    })
    .catch((e) => console.log(e))
})
