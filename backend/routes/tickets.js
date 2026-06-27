import express from 'express';
import {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
  getTickets,
  updateTicketStatus
} from '../controllers/ticketController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createTicket)
  .get(protect, admin, getTickets);

router.route('/mytickets')
  .get(protect, getMyTickets);

router.route('/:id')
  .get(protect, getTicketById);

router.route('/:id/reply')
  .post(protect, replyToTicket);

router.route('/:id/status')
  .put(protect, admin, updateTicketStatus);

export default router;
