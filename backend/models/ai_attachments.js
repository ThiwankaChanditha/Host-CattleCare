const mongoose = require('mongoose');
const { Schema } = mongoose;

const aiAttachmentSchema = new Schema({
    ai_record_id: { type: Schema.Types.ObjectId, ref: 'ArtificialInsemination', required: true },
    original_name: { type: String, required: true },
    file_name: { type: String, required: true },
    file_path: { type: String, required: true },
    file_size: { type: Number, required: true },
    mime_type: { type: String, required: true },
    description: { type: String, trim: true },
    uploaded_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploaded_at: { type: Date, default: Date.now }
}, {
    collection: 'ai_attachments',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const AIAttachment = mongoose.model('AIAttachment', aiAttachmentSchema);

module.exports = AIAttachment; 