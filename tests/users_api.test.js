require('dotenv').config()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

   
const initialUsers = [
    {
        username: "user1",
        name: "test",
        password: "a"
    },
    {
        name: "test2",
        password: "password"
    },
    {
        username: "new user",
        name: "admin",
        password: "password"
    }
]

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlZpbGxlIiwiaWQiOiI2MTA1ODllNjI5ZmQzMzA5OWNhY2NhN2YiLCJpYXQiOjE2Mjc3NTMxMjZ9.jE1Cy3W9WiZ_ZciTmOyGrxE25hZ9l8CY0WjVOK67D60'

beforeEach(async () => {
    await User.deleteMany({})
    let userObject = new User(initialUsers[2])
    await userObject.save()
})

const api = supertest(app)


test('new user', async() => {
    await api.post('/api/users')
    .set('Authorization', token)
    .send(initialUsers[2])
})

test('user creation fails with too short password', async () => {
    const res = await api.post('/api/users')
        .send(initialUsers[0])
        .expect(400)
        .expect('Content-Type', /application\/json/)

    expect(res.body).toContain("password too short")

})

test('user creation fails with missing username', async () => {
    const res = await api.post('/api/users')
        .send(initialUsers[1])
        .expect(400)
        .expect('Content-Type', /application\/json/)

    expect(res.body).toContain("invalid username or password")
})

test('user creation fails with existing username', async () => {
    const newUser = {
        username: "ville",
        name: "admin",
        password: "password"
    }
    const res = await api.post('/api/users')
        .send(newUser)
        .expect(400)

    expect(res.body).toContain("invalid username or password")
})


afterAll(() => {
    mongoose.connection.close()
})