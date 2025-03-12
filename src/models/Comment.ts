import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  user: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: [true, 'Por favor, adicione um conteúdo'],
      maxlength: [500, 'O comentário não pode ter mais de 500 caracteres'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComment>('Comment', CommentSchema);