import mongoose, { Schema, Document } from "mongoose";

export interface IUserQuiz extends Document {
  userId: string;
  quizId: string;
  playedAt: Date;
}

const userQuizSchema: Schema = new Schema({
  userId: { type: String, required: true }, // discordId do usuário
  quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  playedAt: { type: Date, default: Date.now },
});

export const UserQuiz = mongoose.model<IUserQuiz>("UserQuiz", userQuizSchema);
