import { supabase } from '../config/supabase.js';
import { memoryTickets } from '../config/memoryStore.js';

// Map Postgres row to Mongoose structure
const mapTicketToFrontend = (t) => {
  if (!t) return null;
  return {
    _id: t.id,
    id: t.id,
    userId: t.profiles ? {
      _id: t.profiles.id,
      id: t.profiles.id,
      name: t.profiles.name,
      email: t.profiles.email
    } : t.user_id,
    subject: t.subject,
    description: t.message,
    status: t.status,
    messages: t.messages || [],
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
};

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

    const { data: createdTicket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: req.user._id,
        subject,
        message: description,
        messages: [{
          sender: 'user',
          text: description,
          createdAt: new Date().toISOString()
        }]
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(mapTicketToFrontend(createdTicket));
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
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(tickets.map(mapTicketToFrontend));
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
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*, profiles:user_id(id, name, email)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (ticket) {
      if (ticket.user_id !== req.user._id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this ticket' });
      }
      res.json(mapTicketToFrontend(ticket));
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

      const io = req.app.get('socketio');
      if (io) {
        io.emit(`ticketUpdate_${ticket._id}`, ticket);
      }

      return res.json(ticket);
    }
    return res.status(404).json({ message: 'Ticket not found' });
  }

  try {
    const { data: ticket, error: findError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findError) throw findError;
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user_id !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
    }

    const sender = req.user.role === 'admin' ? 'agent' : 'user';
    const messages = ticket.messages || [];
    messages.push({
      sender,
      text,
      createdAt: new Date().toISOString()
    });

    let finalStatus = ticket.status;
    if (sender === 'user' && finalStatus === 'resolved') {
      finalStatus = 'open';
    }

    const { data: updatedTicket, error: updateError } = await supabase
      .from('support_tickets')
      .update({ messages, status: finalStatus })
      .eq('id', req.params.id)
      .select('*, profiles:user_id(id, name, email)')
      .single();

    if (updateError) throw updateError;

    const mapped = mapTicketToFrontend(updatedTicket);

    const io = req.app.get('socketio');
    if (io) {
      io.emit(`ticketUpdate_${ticket.id}`, mapped);
    }

    res.json(mapped);
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
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*, profiles:user_id(id, name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(tickets.map(mapTicketToFrontend));
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
    const { data: updatedTicket, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', req.params.id)
      .select('*, profiles:user_id(id, name, email)')
      .single();

    if (error) throw error;

    if (updatedTicket) {
      res.json(mapTicketToFrontend(updatedTicket));
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
