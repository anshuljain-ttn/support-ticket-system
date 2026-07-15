import mongoose, { Schema, type HydratedDocument, type InferSchemaType, type Model } from 'mongoose';

const commentSchema = new Schema(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

commentSchema.index({ ticketId: 1, createdAt: -1 });
commentSchema.index({ message: 'text' });

export type CommentDocument = HydratedDocument<InferSchemaType<typeof commentSchema>>;

export type CommentModel = Model<CommentDocument>;

export const Comment =
  (mongoose.models.Comment as CommentModel | undefined) ??
  mongoose.model<CommentDocument>('Comment', commentSchema);
