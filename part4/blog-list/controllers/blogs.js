const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
	response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
	const body = request.body;

	const decodedToken = jwt.verify(request.token, process.env.SECRET);

	if (!request.token || !decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' });
	}

	const user = await User.findById(decodedToken.id);

	const blog = new Blog({
		title: body.title,
		url: body.url,
		likes: body.likes,
		author: body.author,
		user: user._id,
	});

	if (!blog.author || !blog.url) {
		return response.status(400).end();
	}

	const savedBlog = await blog.save();

	user.blogs = user.blogs.concat(savedBlog._id);

	await user.save();

	response.status(201).json(savedBlog);
});

blogRouter.delete('/:id', async (request, response) => {
	const decodedToken = jwt.verify(request.token, process.env.SECRET);

	if (!request.token || !decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' });
	}

	const blog = await Blog.findById(request.params.id);

	console.log(blog.user);
	console.log(blog.user.toString());

	if (blog.user.toString() === decodedToken.id.toString()) {
		await Blog.findByIdAndRemove(request.params.id);
		response.status(204).end();
	} else {
		response
			.status(401)
			.json({ error: 'only the creator can delete the blog' });
	}
});

blogRouter.put('/:id', async (request, response) => {
	const body = request.body;

	const blog = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes,
	};

	const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
		new: true,
	});

	response.json(updatedBlog);
});

module.exports = blogRouter;
