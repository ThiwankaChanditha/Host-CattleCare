const mongoose = require('mongoose');
const { Schema } = mongoose;

const programAttachmentSchema = new Schema({
    program_id: { type: Schema.Types.ObjectId, ref: 'ExtensionProgram', required: true },
    file_name: { type: String, required: true },
    original_name: { type: String, required: true },
    file_path: { type: String, required: true },
    file_size: { type: Number, required: true },
    mime_type: { type: String, required: true },
    description: { type: String },
    uploaded_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploaded_at: { type: Date, default: Date.now }
}, {
    collection: 'program_attachments',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const ProgramAttachment = mongoose.model('ProgramAttachment', programAttachmentSchema);

module.exports = ProgramAttachment; 