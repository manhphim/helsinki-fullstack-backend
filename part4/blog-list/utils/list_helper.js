const dummy = (blogs) => {
	return 1;
};

const totalLikes = (blogs) => {
	return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlogs = (blogs) => {
	const favoriteBlog = blogs.reduce((favorite, blog) => {
		if (favorite.likes < blog.likes) {
			return blog;
		}
		return favorite;
	}, blogs[0]);
	return {
		title: favoriteBlog.title,
		author: favoriteBlog.author,
		likes: favoriteBlog.likes,
	};
};

const mostBlogs = (blogs) => {
	const authors = blogs.reduce((authors, blog) => {
		if (authors[blog.author]) {
			authors[blog.author] += 1;
		} else {
			authors[blog.author] = 1;
		}
		return authors;
	}, {});
	const author = Object.keys(authors).reduce((author, currentAuthor) => {
		if (authors[author] < authors[currentAuthor]) {
			return currentAuthor;
		}
		return author;
	}, Object.keys(authors)[0]);
	return {
		author,
		blogs: authors[author],
	};
};

const mostLikes = (blogs) => {
	const authors = blogs.reduce((authors, blog) => {
		if (authors[blog.author]) {
			authors[blog.author] += blog.likes;
		} else {
			authors[blog.author] = blog.likes;
		}
		return authors;
	}, {});
	const author = Object.keys(authors).reduce((author, currentAuthor) => {
		if (authors[author] < authors[currentAuthor]) {
			return currentAuthor;
		}
		return author;
	});
	return {
		author,
		likes: authors[author],
	};
};
module.exports = {
	dummy,
	totalLikes,
	favoriteBlogs,
	mostBlogs,
	mostLikes,
};
