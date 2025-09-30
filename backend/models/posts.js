// backend/models/posts.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for comments (this will be embedded within a Post)
const commentSchema = new Schema(
    {
        // Reference to the User who posted the comment
        author_id: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Refers to the 'User' model
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Automatically adds created_at and updated_at
    }
);

// Define the main schema for forum posts
const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 200
        },
        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 10
        },
        // Reference to the User who created the post
        author_id: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Refers to the 'User' model
            required: true
        },
        // Array of embedded comment documents
        comments: [commentSchema]
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Automatically adds created_at and updated_at
    }
);

// Create the Post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;