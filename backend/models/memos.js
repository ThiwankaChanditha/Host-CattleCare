const mongoose = require('mongoose');
const { Schema } = mongoose;

const memoSchema = new Schema({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  content: { 
    type: String, 
    required: true, 
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  due_date: { 
    type: Date 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
}, {
  collection: 'memos',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Memo = mongoose.model('Memo', memoSchema);

module.exports = Memo; 