const supertest = require('supertest');
const mongoose = require('mongoose');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
	await Blog.deleteMany({});

	const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
	const promiseArray = blogObjects.map((blog) => blog.save());
	await Promise.all(promiseArray);
});

test('blogs are returned as json', async () => {
	console.log('entered test');

	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/);
});

test('unique identifier property of the blog posts is named id', async () => {
	const blogsInDb = await helper.blogsInDb();
	expect(blogsInDb[0].id).toBeDefined();
});

test('a valid blog can be added', async () => {
	const newBlog = {
		title: 'Test Blog',
		author: 'Test Author',
		url: 'http://test.com',
		likes: 0,
	};

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/);

	const blogsAtEnd = await helper.blogsInDb();
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

	const content = blogsAtEnd.map((n) => n.title);
	expect(content).toContain('Test Blog');
});

test('blog without likes will be default to 0', async () => {
	const newBlog = {
		title: 'Test Blog',
		author: 'Test Author',
		url: 'http://test.com',
	};

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/);

	const blogsAtEnd = await helper.blogsInDb();

	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
	expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0);
});

test('blog without title and url is not added', async () => {
	const newBlog = {
		title: 'Test Blog',
	};

	await api.post('/api/blogs').send(newBlog).expect(400);
});

test('deletion of a blog succeeds with status code 204 if id is valid', async () => {
	const blogsAtStart = await helper.blogsInDb();
	const blogToDelete = blogsAtStart[0];

	await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

	const blogsAtEnd = await helper.blogsInDb();
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);
});

test('delete a blog that does not exist', async () => {
	const nonExistingId = await helper.nonExistingId();

	await api.delete(`/api/blogs/${nonExistingId}`).expect(404);
});

test('updating a blog succeeds with status code 200 if id is valid', async () => {
	const blogsAtStart = await helper.blogsInDb();
	const blogToUpdate = blogsAtStart[0];

	const updatedBlog = {
		...blogToUpdate,
		likes: 100,
	};

	await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200);
});

afterAll(() => {
	mongoose.connection.close();
});
