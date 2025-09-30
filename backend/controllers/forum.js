const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Post = require('../models/posts');

// Middleware to check if user is authenticated
const authMiddleware = (req, res, next) => {
    if (!req.headers.authorization) {
        console.warn('Authentication failed: No Authorization header provided.');
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const userId = new mongoose.Types.ObjectId(req.headers.authorization);
        req.user = { _id: userId };
        next();
    } catch (err) {
        console.error('Auth middleware error: Invalid ObjectId format in Authorization header.', err);
        return res.status(401).json({ message: 'Invalid authentication token format.' });
    }
};

// --- GET all forum posts (with optional sorting) ---
router.get('/', async (req, res) => {
    try {
        const { sort } = req.query;

        let sortOption = { created_at: -1 }; // Default to newest posts first

        if (sort === 'oldest') {
            sortOption = { created_at: 1 };
        }

        let posts = await Post.find({})
            .populate('author_id', 'username email full_name')
            .populate('comments.author_id', 'username email full_name')
            .sort(sortOption);

        if (sort === 'most_comments') {
            posts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
        }

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error fetching posts.' });
    }
});

// --- GET a single post by ID ---
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid Post ID format.' });
        }

        const post = await Post.findById(postId)
            .populate('author_id', 'username email full_name')
            .populate('comments.author_id', 'username email full_name');

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching single post:', error);
        res.status(500).json({ message: 'Server error fetching post.' });
    }
});

// --- POST: Create a new forum post ---
router.post('/', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    // req.user._id is populated by authMiddleware
    const author_id = req.user._id;

    if (!title || !content || !author_id) {
        return res.status(400).json({ message: 'Title, content, and author are required.' });
    }

    try {
        const newPost = new Post({ title, content, author_id });
        await newPost.save();

        const populatedPost = await Post.findById(newPost._id)
            .populate('author_id', 'username full_name');
        res.status(201).json({ message: 'Post created successfully!', post: populatedPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error creating post.' });
    }
});

// --- PUT: Update an existing forum post ---
router.put('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;
    const editor_id = req.user._id;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(editor_id)) {
        return res.status(400).json({ message: 'Invalid ID format in request.' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (post.author_id.toString() !== editor_id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You can only edit your own posts.' });
        }

        post.title = title;
        post.content = content;
        await post.save();

        const updatedPopulatedPost = await Post.findById(post._id)
            .populate('author_id', 'username full_name');

        res.status(200).json({ message: 'Post updated successfully!', post: updatedPopulatedPost });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error updating post.' });
    }
});

// --- DELETE: Delete a forum post ---
router.delete('/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const deleter_id = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(deleter_id)) {
        return res.status(400).json({ message: 'Invalid ID format in request.' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (post.author_id.toString() !== deleter_id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own posts.' });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully!' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error deleting post.' });
    }
});


// --- POST: Add a comment to a post ---
router.post('/:postId/comments', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const author_id = req.user._id;

    if (!content || !author_id) {
        return res.status(400).json({ message: 'Comment content and author are required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(author_id)) {
        return res.status(400).json({ message: 'Invalid ID format.' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const newComment = { author_id, content };
        post.comments.push(newComment);
        await post.save();

        const savedComment = post.comments[post.comments.length - 1];

        const populatedComment = await Post.aggregate([
            { $match: { _id: post._id } },
            { $unwind: '$comments' },
            { $match: { 'comments._id': savedComment._id } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.author_id',
                    foreignField: '_id',
                    as: 'comments.author_info'
                }
            },
            { $unwind: '$comments.author_info' },
            {
                $project: {
                    'comments.content': '$comments.content',
                    'comments.created_at': '$comments.created_at',
                    'comments._id': '$comments._id',
                    'comments.author_id': {
                        _id: '$comments.author_info._id',
                        username: '$comments.author_info.username',
                        full_name: '$comments.author_info.full_name'
                    }
                }
            }
        ]);

        if (populatedComment.length > 0) {
            res.status(201).json({ message: 'Comment added successfully!', comment: populatedComment[0].comments });
        } else {
            res.status(201).json({ message: 'Comment added successfully!', comment: savedComment });
        }

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error adding comment.' });
    }
});

// --- PUT: Update an existing comment on a post ---
router.put('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const editor_id = req.user._id;

    if (!content) {
        return res.status(400).json({ message: 'Comment content is required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(editor_id)) {
        return res.status(400).json({ message: 'Invalid ID format in request.' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const commentToUpdate = post.comments.id(commentId);

        if (!commentToUpdate) {
            return res.status(404).json({ message: 'Comment not found within this post.' });
        }

        if (commentToUpdate.author_id.toString() !== editor_id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You can only edit your own comments.' });
        }

        commentToUpdate.content = content;
        await post.save();

        const populatedComment = await Post.aggregate([
            { $match: { _id: post._id } },
            { $unwind: '$comments' },
            { $match: { 'comments._id': commentToUpdate._id } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'comments.author_id',
                    foreignField: '_id',
                    as: 'comments.author_info'
                }
            },
            { $unwind: '$comments.author_info' },
            {
                $project: {
                    'comments.content': '$comments.content',
                    'comments.created_at': '$comments.created_at',
                    'comments._id': '$comments._id',
                    'comments.author_id': {
                        _id: '$comments.author_info._id',
                        username: '$comments.author_info.username',
                        full_name: '$comments.author_info.full_name'
                    }
                }
            }
        ]);

        if (populatedComment.length > 0) {
            res.status(200).json({ message: 'Comment updated successfully!', comment: populatedComment[0].comments });
        } else {
            res.status(200).json({ message: 'Comment updated successfully!', comment: commentToUpdate });
        }

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Server error updating comment.' });
    }
});

// --- DELETE: Delete a comment from a post ---
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const deleter_id = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(deleter_id)) {
        return res.status(400).json({ message: 'Invalid ID format in request.' });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const commentToDelete = post.comments.id(commentId);

        if (!commentToDelete) {
            return res.status(404).json({ message: 'Comment not found within this post.' });
        }

        if (commentToDelete.author_id.toString() !== deleter_id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own comments.' });
        }

        post.comments.pull({ _id: commentId });
        await post.save();

        res.status(200).json({ message: 'Comment deleted successfully!' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error deleting comment.' });
    }
});


module.exports = router;