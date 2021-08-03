require('dotenv').config()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let token;
beforeEach(async () => {
    await Blog.deleteMany({})
    console.log("blogs deleted")
    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
    console.log("new blogs created")
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secretpassword', 10)
    const user = new User({
        username: "demotest",
        passwordHash
    })
    await user.save()

    const res = await api.post('/api/login')
        .send({
            username: 'demotest',
            password: 'secretpassword'
        })

    token = res.body.token
})

describe("blogs are returned", () => {
    test('all blogs returned', async () => {
        const res = await api.get('/api/blogs')
            .expect('Content-Type', /application\/json/)

        expect(res.body).toHaveLength(helper.initialBlogs.length)
    })

    test('blogs _id is returned as id', async () => {
        const res = await api.get('/api/blogs')
        const id = res.body.map(blog => blog.id)

        expect(id).toBeDefined()
    })
})

describe('adding blogs', () => {
    test('new blog is added', async () => {
        const newBlog = {
            title: "new blog",
            author: "Ville",
            url: "demo.com",
            likes: 4
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const allBlogs = await api.get('/api/blogs')
        expect(allBlogs.body).toHaveLength(helper.initialBlogs.length + 1)
    })

    test('likes without value returns zero', async () => {
        const newBlog = {
            title: "new test",
            author: "John",
            url: "tests.com",
            likes: null
        }
        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)

        const res = await api.get('/api/blogs')
        expect(res.body[2].likes).toBe(0)
    })

    test('blog without title or url returns bad request', async () => {
        const newBlog = {
            author: "Ville S",
            likes: 6
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })
})

describe('deleting blog', () => {
    test('one blog is deleted with id', async() => {
        const userId = await User.find({username: "demotest"})
        
        const newBlog = new Blog({
            title: "delete this",
            author: "Ville S",
            url: "delete.com",
            likes: 10,
            user: userId[0]._id
        })


        await newBlog.save()

        const blogId = await api.get('/api/blogs')
       
        await api
        .delete(`/api/blogs/${blogId.body[2].id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(204)
    })
})

describe('updating blog', () => {
    test('blog likes is updated', async() => {
        const res = await api.get('/api/blogs')
        await api.put('/api/blogs')
        .send({id: res.body[1]._id, likes: 11})
        .expect(200)

    })
})

afterAll(() => {
    mongoose.connection.close()
})
