import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'agent'], default: 'user' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  messages: [messageSchema]
}, {
  timestamps: true
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
