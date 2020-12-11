const Router = require('koa-router')
const Post = require('../models/post')
const PostBody = require('../models/postBody')
const { addMenu, removeMenu } = require('../menus')
const Joi = require('joi')

const router = new Router()

/* posts 종류 : 
	menus: get(/posts/menus)
	list: get(/posts/)
	tag list: get(/posts/:tags)
	read: get(/posts/id/:postId)
	post: post(/posts/)
	update: patch(/posts/:postId)
	delete: delete(/posts/:postId)
*/
// 라우터 설정
//포스트 메뉴 목록 list /posts/menus
router.get('/menus', async (ctx) => {
  try {
    const posts = await Post.find()
    const mainMenus = {}
    const subMenus = []
    if (posts) {
      for (let post of posts) {
        //포스트의 태그정보를 menus에 저장
        let i = 0
        for (let tag of post.tags) {
          if (i === 0) {
            //첫번째 태그는 대메뉴로 사용
            if (!mainMenus[tag]) {
              mainMenus[tag] = { cnt: 1, name: tag }
            } else {
              mainMenus[tag]['cnt']++
            }
          } else {
            //서브메뉴 추가
            if (!mainMenus[post.tags[0]][tag]) {
              mainMenus[post.tags[0]][tag] = { cnt: 1, name: tag }
            } else {
              mainMenus[post.tags[0]][tag]['cnt']++
            }
            //Quill 태그 추가
            if (subMenus.indexOf(tag) === -1) {
              subMenus.push(tag)
            }
          }
          i++
        }
      }
    }
    subMenus.sort()

    ctx.body = {
      mainMenus: mainMenus,
      subMenus: subMenus,
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})
//포스트 전체 목록 list
router.get('/', async (ctx) => {
  try {
    const posts = await Post.find().sort({ postId: -1 })
    ctx.body = posts
  } catch (e) {
    ctx.throw(500, e)
  }
})
//특정 태그 포스트 목록 list
router.get('/tag/:tag', async (ctx) => {
  let page = parseInt(ctx.query.page, 10) || 1 //페이지를 숫자로 변환. 없다면 1
  if (page < 1) page = 1

  try {
    const { tag } = ctx.params
    const posts = await Post.find({ tags: tag })
      .sort({ postId: -1 }) //역순
      .limit(10) //10건씩 불러옴
      .skip((page - 1) * 10) //10건마다 페이지 스킵
    const postCount = await Post.countDocuments({ tags: tag }) //전체 페이지 수를 헤더에 저장

    //headers 세팅
    //ctx.set('Total-post', postCount)
    //ctx.set('Last-Page', Math.ceil(postCount / 5))

    if (posts) {
      let list = []
      for (let i of posts) {
        list.push(i)
      }
      ctx.body = {
        list: list,
        postCount: postCount,
      }
    } else {
      ctx.status = 404 //Not found
      return
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})
//특정 포스트 조회 read
router.get('/:postId', async (ctx) => {
  try {
    const { postId } = ctx.params

    if (postId === 'recents') {
      //recents면 최근 게시글 5개 불러오기
      const posts = await Post.find({ postId: { $gt: 1 } })
        .sort({ publishedDate: -1 })
        .limit(5)
      if (posts) {
        ctx.body = posts
      } else {
        ctx.status = 404 //Not found
        return
      }
    } else if (postId === 'popular') {
      //popular면 댓글, 조회수, 게시일자로 정렬해서 게시글 5개 불러오기
      let posts = await Post.find({ postId: { $gt: 1 } }).sort({ views: -1, publishedDate: -1 })
      if (posts) {
        posts.sort(function (a, b) {
          return b.comments.length - a.comments.length
        })
        posts.splice(5)
        ctx.body = posts
      } else {
        ctx.status = 404 //Not found
        return
      }
    } else {
      //포스트아이디가 있으면 포스트 1개 불러오기
      const post = await Post.findOne({ postId: postId })
      if (post) {
        ctx.body = post
        ctx.state.post = post
        let views = post.views ? post.views + 1 : 1
        await Post.findOneAndUpdate({ postId }, { views: views })
      } else {
        ctx.status = 404 //Not found
        return
      }
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})
//특정 포스트바디 조회
router.get('/postBody/:postId', async (ctx) => {
  try {
    const { postId } = ctx.params
    const post = await PostBody.findOne({ postId: postId })
    if (post) {
      ctx.body = post
      ctx.state.post = post
    } else {
      ctx.status = 404 //Not found
      return
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})

//포스트 작성 post
router.post('/', async (ctx) => {
  const schema = Joi.object().keys({
    //객체가 다음 필드를 가지고 있음을 검증
    postId: Joi.number(),
    title: Joi.string().required(), //required가 있으면 필수항목
    body: Joi.any().required(),
    text: Joi.string(),
    tags: Joi.array().items(Joi.string()).required(),
    thumbnail: Joi.any(),
  })
  const result = schema.validate(ctx.request.body)
  if (result.error) {
    console.log('Joi validation fail.', result.error)
    ctx.status = 400 //Bad Request
    ctx.body = result.error
    return
  }

  try {
    //postId 생성
    let postId = 1
    const posts = await Post.find().exec()
    if (posts.length > 0) {
      postId = posts[posts.length - 1].postId + 1
    }
    const { title, body, text, tags, thumbnail } = ctx.request.body
    const post = new Post({
      postId,
      title,
      text,
      tags,
      thumbnail,
      user: ctx.state.user,
    })
    await post.save()

    //postBody가 있는지 체크
    console.log(body)
    let postBody = await PostBody.findOne({ postId: postId })
    if (postBody) {
      //postBody가 이미 있으면 body 업데이트
      await PostBody.findOneAndUpdate({ postId: postId }, { body: body }, { new: true })
    } else {
      //없으면 새로 생성
      postBody = new PostBody({
        postId,
        body,
      })
      await postBody.save()
    }

    //메뉴에 태그 추가하기
    addMenu(tags[0], 1)
    addMenu(tags[1], 2, tags[0])

    ctx.body = post
  } catch (e) {
    ctx.throw(500, e)
  }
})
//특정 포스트 수정 update
//router.patch('/:postId', checkLogin, getPostByPostId, checkOwnPost, async ctx => {
router.patch('/:postId', async (ctx) => {
  try {
    const { postId } = ctx.params
    const { tags } = ctx.request.body
    //태그 변경 위해 기존 정보 가져오기
    let originPost = await Post.findOne({ postId: postId })
    if (originPost.tags[0] === tags[0]) {
      if (originPost.tags[1] !== tags[1]) {
        removeMenu(originPost.tags[1])
        addMenu(tags[1], 2, tags[0]) //name, level, parent, order
      }
    } else {
      removeMenu(originPost.tags[0])
      addMenu(tags[0], 1) //name, level, parent, order
      removeMenu(originPost.tags[1])
      addMenu(tags[1], 2, tags[0]) //name, level, parent, order
    }
    //포스트 수정하기
    const post = await Post.findOneAndUpdate(
      { postId: postId },
      {
        ...ctx.request.body,
        body: '',
        //publishedDate: new Date(new Date().getTime() + 9 * 60 * 60 * 1000),
        user: ctx.state.user,
      },
      { new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
    )
    await PostBody.findOneAndUpdate(
      { postId: postId },
      {
        ...ctx.request.body,
      },
      { new: true }, // 업데이트 후의 데이터를 반환, false라면 업데이트 전의 데이터 반환
    )
    if (post) {
      ctx.body = post
    } else {
      ctx.status = 204 //No content
      return
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})

//특정 포스트 삭제 delete : delete(/posts/:postId)
//router.delete('/:postId', checkLogin, getPostByPostId, checkOwnPost, async (ctx) => {
router.delete('/:postId', async (ctx) => {
  try {
    const { postId } = ctx.params
    const originPost = await Post.findOne({ postId: postId })
    removeMenu(originPost.tags[0])
    removeMenu(originPost.tags[1])
    const post = await Post.findOneAndRemove({ postId: postId })
    await PostBody.findOneAndRemove({ postId: postId })
    if (post) {
      ctx.body = post
    } else {
      ctx.status = 204 //No content
      return
    }
  } catch (e) {
    ctx.throw(500, e)
  }
})

module.exports = router
