import mongoose, { Document, Schema } from 'mongoose';

export interface IVote {
  user: mongoose.Types.ObjectId;
  value: 'up' | 'down';
}

export interface ITopic extends Document {
  title: string;
  description: string;
  user: mongoose.Types.ObjectId;
  votes: IVote[];
  voteCount: {
    up: number;
    down: number;
    total: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor, adicione um título'],
      trim: true,
      maxlength: [100, 'O título não pode ter mais de 100 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'Por favor, adicione uma descrição'],
      maxlength: [500, 'A descrição não pode ter mais de 500 caracteres'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    votes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        value: {
          type: String,
          enum: ['up', 'down'],
          required: true,
        },
      },
    ],
    voteCount: {
      up: {
        type: Number,
        default: 0,
      },
      down: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para calcular contagem de votos antes de salvar
TopicSchema.pre<ITopic>('save', function (next) {
  const upVotes = this.votes.filter((vote) => vote.value === 'up').length;
  const downVotes = this.votes.filter((vote) => vote.value === 'down').length;
  
  this.voteCount = {
    up: upVotes,
    down: downVotes,
    total: upVotes - downVotes,
  };
  
  next();
});

export default mongoose.model<ITopic>('Topic', TopicSchema);