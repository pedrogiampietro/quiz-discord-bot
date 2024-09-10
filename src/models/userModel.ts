import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  discordId: string;
  guildId: string;
  username: string;
  quizzesPlayed: number;
  correctAnswers: number;
  wrongAnswers: number;
}

const userSchema: Schema = new Schema({
  discordId: { type: String, required: true },
  guildId: { type: String, required: true },
  username: { type: String, required: true },
  quizzesPlayed: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
});

// Índice único para discordId e guildId combinados, permitindo múltiplos registros por usuário em servidores diferentes
userSchema.index({ discordId: 1, guildId: 1 }, { unique: true });

export const User = mongoose.model<IUser>("User", userSchema);
