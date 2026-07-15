export const TicketActions = {
  CREATE: 'ticket:create',
  VIEW: 'ticket:view',
  LIST: 'ticket:list',
  UPDATE: 'ticket:update',
  ASSIGN: 'ticket:assign',
  STATUS_CHANGE: 'ticket:status_change',
  COMMENT: 'ticket:comment',
} as const;

export type TicketAction = (typeof TicketActions)[keyof typeof TicketActions];

export const HistoryActions = {
  CREATED: 'CREATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  ASSIGNED: 'ASSIGNED',
  UPDATED: 'UPDATED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  DESCRIPTION_CHANGED: 'DESCRIPTION_CHANGED',
} as const;

export type HistoryAction = (typeof HistoryActions)[keyof typeof HistoryActions];
