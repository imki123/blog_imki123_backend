const Router = require('koa-router')
const Menu = require('../models/menu')

const router = new Router()

/* menus 종류 : 
    get: get(/menus/)
*/

// 라우터 설정
//get: get(/menus/)
router.get('/', async (ctx) => {
	try {
		const originMenus = await Menu.find().sort({ level: 1, order: 1, name: 1 })
		let menus = []
		let idx = 0
		for (let i of originMenus) {
			if (i.level === 1) {
				let subMenus = []
				for (let j of originMenus) {
					if (i.name === j.parent) {
						subMenus.push({ name: j.name, count: j.count })
					}
				}
				menus[idx] = {
					name: i.name,
					count: i.count,
					order: i.order,
					level: i.level,
					subMenus: subMenus,
				}
			}
			idx++
		}
		if (menus) {
			ctx.body = menus
		} else {
			console.log('no menus')
			ctx.status = 204 //No Content
		}
	} catch (e) {
		ctx.throw(500, e)
	}
})
//add: post(/menus/)
router.post('/', async (ctx) => {
	try {
		const { name } = ctx.request.body
		let menu = await Menu.findOne({ name: name })
		if (menu) {
			menu.count++
			menu = await Menu.findOneAndUpdate({ name: name }, menu, { new: true })
			ctx.body = menu
			return
		}

		menu = new Menu({
			...ctx.request.body,
		})
		menu.save()
		ctx.body = menu
	} catch (e) {
		ctx.throw(500, e)
	}
})

module.exports = router
