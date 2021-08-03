const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res) => {
    const body = req.body
    if(body.password.length < 3) {
        return res.status(400).json("password too short")
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    
    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash
    })
    try {
    const savedUser = await user.save()
    res.json(savedUser)
    } catch(err){
        res.status(400).json("invalid username or password")
    }
})

usersRouter.get('/', async (req, res) => {
    const users = await User.find({}).populate('blogs')
    res.json(users.map(user => user.toJSON()))
})

module.exports = usersRouter