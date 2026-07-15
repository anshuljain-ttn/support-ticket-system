import mongoose, { Schema, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

import { HistoryActions } from '@/constants/permissions.js';
import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';

const historyEntrySchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: Object.values(HistoryActions),
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    previousValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    _id: true,
    versionKey: false,
  },
);

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    priority: {
      type: String,
      required: true,
      enum: Object.values(TicketPriorities),
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TicketStatuses),
      default: TicketStatuses.OPEN,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    history: {
      type: [historyEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ title: 'text', description: 'text' });

export type TicketDocument = HydratedDocument<InferSchemaType<typeof ticketSchema>>;

export type TicketModel = Model<TicketDocument>;

export const Ticket =
  (mongoose.models.Ticket as TicketModel | undefined) ??
  mongoose.model<TicketDocument>('Ticket', ticketSchema);
