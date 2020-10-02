const Router = require('koa-router')
const Menu = require('../models/menu')

const router = new Router()

/* menus 종류 : 
    get: get(/menus/)
*/
const addMenu = async (name, level, parent, order) => {
	let menu = await Menu.findOne({ name: name }) //태그가 등록되어있는지 체크
	if (menu) {
		//있으면
		menu.count++ //카운트 증가
		menu = await Menu.findOneAndUpdate({ name: name }, menu, { new: true })
		console.log('addMenu:', menu.count)
	} else if(name && level){
		//없으면
		if (!parent) {
			menu = new Menu({
				name: name,
				level: level,
				order: order,
			})
		} else {
			menu = new Menu({
				name: name,
				level: level,
				parent: parent,
			})
		}
		menu = await menu.save()
		console.log('addMenu:', menu.count)
	}
}

const removeMenu = async (name) => {
	let menu = await Menu.findOne({ name: name }) //태그가 등록되어있는지 체크
	if (menu) {
		//있으면
		if (menu.count > 1) {
			menu.count-- //카운트 감소
			menu = await Menu.findOneAndUpdate({ name: name }, menu, { new: true })
		} else {
			menu = await Menu.findOneAndRemove({ name: name })
		}
		console.log('removeMenu:', menu.count)
	}
}
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

module.exports = {router, addMenu, removeMenu}