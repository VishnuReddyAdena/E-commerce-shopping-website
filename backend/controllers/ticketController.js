import SupportTicket from '../models/SupportTicket.js';
import { memoryTickets, memoryUsers } from '../config/memoryStore.js';

// @desc    Create a support ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
  const { subject, description } = req.body;

  if (!global.isDbConnected) {
    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }
    const created = {
      _id: `tix_${Math.random().toString(36).substring(2, 9)}`,
      userId: { _id: req.user._id, name: req.user.name, email: req.user.email },
      subject,
      description,
      status: 'open',
      messages: [{
        _id: `msg_${Math.random().toString(36).substring(2, 9)}`,
        sender: 'user',
        text: description,
        createdAt: new Date()
      }],
      createdAt: new Date()
    };
    memoryTickets.push(created);
    return res.status(201).json(created);
  }

  try {
    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    const ticket = new SupportTicket({
      userId: req.user._id,
      subject,
      description,
      messages: [{
        sender: 'user',
        text: description
      }]
    });

    const createdTicket = await ticket.save();
    res.status(201).json(createdTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get log-in user tickets
// @route   GET /api/tickets/mytickets
// @access  Private
export const getMyTickets = async (req, res) => {
  if (!global.isDbConnected) {
    const list = memoryTickets.filter(t => {
      const tId = typeof t.userId === 'object' ? t.userId._id : t.userId;
      return tId === req.user._id;
    });
    return res.json(list.reverse());
  }

  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get support ticket details
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req, res) => {
  if (!global.isDbConnected) {
    const ticket = memoryTickets.find(t => t._id === req.params.id);
    if (ticket) return res.json(ticket);
    return res.status(404).json({ message: 'Ticket not found' });
  }

  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (ticket) {
      if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this ticket' });
      }
      res.json(ticket);
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a support ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
export const replyToTicket = async (req, res) => {
  const { text } = req.body;

  if (!global.isDbConnected) {
    const ticket = memoryTickets.find(t => t._id === req.params.id);
    if (ticket) {
      const sender = req.user.role === 'admin' ? 'agent' : 'user';
      const msg = {
        _id: `msg_${Math.random().toString(36).substring(2, 9)}`,
        sender,
        text,
        createdAt: new Date()
      };
      ticket.messages.push(msg);

      if (sender === 'user' && ticket.status === 'resolved') {
        ticket.status = 'open';
      }

      // Emit WebSocket update
      const io = req.app.get('socketio');
      if (io) {
        io.emit(`ticketUpdate_${ticket._id}`, ticket);
      }

      return res.json(ticket);
    }
    return res.status(404).json({ message: 'Ticket not found' });
  }

  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (ticket) {
      if (ticket.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
      }

      const sender = req.user.role === 'admin' ? 'agent' : 'user';
      ticket.messages.push({
        sender,
        text
      });

      if (sender === 'user' && ticket.status === 'resolved') {
        ticket.status = 'open';
      }

      const updatedTicket = await ticket.save();

      const io = req.app.get('socketio');
      if (io) {
        io.emit(`ticketUpdate_${ticket._id}`, updatedTicket);
      }

      res.json(updatedTicket);
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all support tickets (Admin)
// @route   GET /api/tickets
// @access  Private/Admin
export const getTickets = async (req, res) => {
  if (!global.isDbConnected) {
    return res.json(memoryTickets);
  }

  try {
    const tickets = await SupportTicket.find({}).populate('userId', 'id name email').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update support ticket status (Admin)
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin
export const updateTicketStatus = async (req, res) => {
  const { status } = req.body;

  if (!global.isDbConnected) {
    const ticket = memoryTickets.find(t => t._id === req.params.id);
    if (ticket) {
      ticket.status = status;
      return res.json(ticket);
    }
    return res.status(404).json({ message: 'Ticket not found' });
  }

  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (ticket) {
      ticket.status = status;
      const updatedTicket = await ticket.save();
      res.json(updatedTicket);
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
