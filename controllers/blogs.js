require('dotenv').config()
const middleware = require('../utils/middleware')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', middleware.tokenExtractor, async (request, response, next) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  if (body.title === undefined || body.url === undefined) {
    response.status(400).end()
  } else {
    try {
      const savedBlog = await blog.save()
      user.blogs = user.blogs.concat(savedBlog.id)
      await user.save()
      response.json(savedBlog.toJSON())
    } catch (err) {
      next(err)
    }
  }
})

blogsRouter.delete('/:id', middleware.tokenExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (blog.user._id.toString() === decodedToken.id.toString()) {
      await Blog.findByIdAndRemove(req.params.id)
      res.status(204).end()
    }else {
      return res.status(401).json({error: 'invalid token'})
    }
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/', async (req, res, next) => {
  const body = req.body
  try {
    await Blog.findByIdAndUpdate(body.id, { likes: body.likes })
    res.status(200).end()
  } catch (err) {
    next(err)
  }
})

module.exports = blogsRouter