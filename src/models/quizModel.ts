import mongoose, { Schema, Document } from "mongoose";

export interface IQuizAnswer {
  content: string;
  isCorrect: boolean;
}

export interface IQuiz extends Document {
  content: string;
  answers: IQuizAnswer[];
  createdAt: Date;
}

const quizAnswerSchema: Schema = new Schema({
  content: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const quizSchema: Schema = new Schema({
  content: { type: String, required: true },
  answers: [quizAnswerSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);
