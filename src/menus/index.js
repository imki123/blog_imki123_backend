const Router = require('koa-router')
const Menus = require('../models/menu')

const router = new Router()

/* menus 종류 : 
    get: get(/menus/)
    add mainMenu: post(/menus/)
    delete mainMenu: delete(/menus/)
    add subMenu: patch(/menus/add/)
    delete subMenu: patch(/menus/delete/)
*/

// 라우터 설정
//get: get(/menus/)
router.get('/', async (ctx) => {
	try {
		const menus = await Menus.find().sort({ order: 1, name: 1 })
		if (menus) {
			ctx.body = menus
		} else {
			console.log('no menus')
		}
	} catch (e) {
		ctx.throw(500, e)
	}
})
//add mainMenu: post(/menus/)
router.post('/', async (ctx) => {
	const { name, order, count, subMenus } = ctx.request.body
	const menu = new Menus({
		name,
		count,
		order,
		subMenus,
	})
	try {
		await menu.save()
		ctx.body = menu
	} catch (e) {
		ctx.throw(500, e)
	}
})
//delete mainMenu: delete(/menus/)
router.delete('/', async (ctx) => {
	const { name } = ctx.request.body
	if (name) {
		try {
			const menu = await Menus.findOneAndRemove({ name: name })
			ctx.body = menu
		} catch (e) {
			ctx.throw(500, e)
		}
	}else{
        ctx.status = 204 //No content
    }
})

//add subMenu: patch(/menus/add/)
router.patch('/add', async (ctx) => {
	const { name, subMenu } = ctx.request.body
	if (name && subMenu) {
		try {
			const menu = await Menus.findOne({ name: name })
			if (menu) {
				for (let i of menu.subMenus) {
					if (i.name === subMenu) {
						//서브메뉴가 이미 있으면 카운트 증가 후 업데이트
						i.count++
						await Menus.findOneAndUpdate({ name: name }, menu, { new: true })
						ctx.body = menu
						return
					}
				}
				menu.subMenus.push({ name: subMenu })
				menu.subMenus.sort(function (a, b) {
					return a.name - b.name
				})
				await Menus.findOneAndUpdate({ name: name }, menu, { new: true })
				ctx.body = menu
            }
            ctx.body = menu
		} catch (e) {
			ctx.throw(500, e)
		}
	}else{
        ctx.status = 204 //No content
    }
})
//delete subMenu: patch(/menus/delete/)
router.patch('/delete', async (ctx) => {
	const { name, subMenu } = ctx.request.body
	if (name && subMenu) {
		try {
			const menu = await Menus.findOne({ name: name })
			if (menu) {
				for (let i of menu.subMenus) {
					if (i.name === subMenu) { //서브메뉴를 찾아서
						if (i.count > 1) {
							//서브메뉴의 카운트가 1보다 크면 카운트 감소 후 업데이트
							i.count--
							await Menus.findOneAndUpdate({ name: name }, menu, { new: true })
							ctx.body = menu
							return
						}else{ // 카운트가 1이하이면 서브메뉴 삭제 
                            menu.subMenus = menu.subMenus.filter(i => i.name !== subMenu )
                            await Menus.findOneAndUpdate({ name: name }, menu, { new: true })
							ctx.body = menu
							return
                        }
					}
                }
                ctx.body = menu
			}
		} catch (e) {
			ctx.throw(500, e)
		}
	}else{
        ctx.status = 204 //No content
    }
})

module.exports = router
