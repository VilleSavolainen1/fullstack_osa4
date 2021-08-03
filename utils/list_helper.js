const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((total, item) => {
        return total + item.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    const mostLikes = Math.max(...blogs.map(blog => blog.likes))
    const likedBlog = blogs.find((item) => {
        return item.likes === mostLikes
    })
    const result = {
        title: likedBlog.title,
        author: likedBlog.author,
        likes: likedBlog.likes
    }
    return result
}

const mostBlogs = (blogs) => {
    const result = {}
    const authors = blogs.map(blog => blog.author)
    authors.forEach((x) => { result[x] = (result[x] || 0) + 1 })
    const keysAndValues = _.map(result, (value, key) => {
        return { author: key, blogs: value }
    })
    const max = Math.max(...keysAndValues.map(item => item.blogs))
    return keysAndValues.find(item => item.blogs === max)
}

const mostLikes = (blogs) => {
    const res = blogs.reduce((acc, obj) => {
        let found = false
        for (let i in acc) {
            if (acc[i].author === obj.author) {
                found = true
                acc[i].likes += obj.likes
            }
        }
        if (!found) {
            acc.push({author: obj.author, likes: obj.likes})
        }
        return acc
    }, [])
    const max = Math.max(...res.map(item => item.likes))
    return res.find(item => item.likes === max)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}