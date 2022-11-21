const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({});

	response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
	const blog = new Blog(request.body);

	if (!blog.author || !blog.url) {
		return response.status(400).end();
	}

	const savedBlog = await blog.save();
	response.status(201).json(savedBlog);
});

blogRouter.delete('/:id', async (request, response) => {
	const blog = await Blog.findByIdAndRemove(request.params.id);
	if (blog) {
		response.status(204).end();
	} else {
		response.status(404).end();
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
