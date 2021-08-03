const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	title: String,
	author: String,
	url: String,
	likes: Number,
})


blogSchema.method('toJSON', function () {
	const { __v, _id, likes, ...object } = this.toObject();
	object.id = _id;
	typeof(object.likes) !== Number ? object.likes = 0 : object.likes = object.likes
	return object;
});

blogSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})


module.exports = mongoose.model('Blog', blogSchema)