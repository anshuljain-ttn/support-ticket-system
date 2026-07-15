import type { NextFunction, Request, Response } from 'express';

import { ticketService } from '@/services/ticket.service.js';
import type {
  CreateTicketBody,
  PatchTicketAssignBody,
  PatchTicketStatusBody,
  TicketListQuery,
  TicketSearchQuery,
  UpdateTicketBody,
} from '@/validators/ticket.validator.js';
import { success } from '@/utils/api-response.js';

export async function listTickets(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tickets = await ticketService.listTickets(req.user!, req.query as unknown as TicketListQuery);
    success(res, tickets);
  } catch (error) {
    next(error);
  }
}

export async function searchTickets(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tickets = await ticketService.searchTickets(
      req.user!,
      req.query as unknown as TicketSearchQuery,
    );
    success(res, tickets);
  } catch (error) {
    next(error);
  }
}

export async function getTicketById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const ticket = await ticketService.getTicketById(req.user!, id);
    success(res, ticket);
  } catch (error) {
    next(error);
  }
}

export async function createTicket(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ticket = await ticketService.createTicket(req.user!, req.body as CreateTicketBody);
    success(res, ticket, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const ticket = await ticketService.updateTicket(req.user!, id, req.body as UpdateTicketBody);
    success(res, ticket);
  } catch (error) {
    next(error);
  }
}

export async function patchTicketStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as PatchTicketStatusBody;
    const ticket = await ticketService.updateStatus(req.user!, id, status);
    success(res, ticket);
  } catch (error) {
    next(error);
  }
}

export async function patchTicketAssign(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const ticket = await ticketService.assignTicket(
      req.user!,
      id,
      req.body as PatchTicketAssignBody,
    );
    success(res, ticket);
  } catch (error) {
    next(error);
  }
}
