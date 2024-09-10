import { User, IUser } from "../models/userModel";

// Função para encontrar ou criar o usuário, considerando o guildId
export async function findOrCreateUser(
  discordId: string,
  guildId: string,
  username: string
): Promise<IUser> {
  let user = await User.findOne({ discordId, guildId });
  if (!user) {
    user = new User({
      discordId,
      guildId,
      username,
    });
    await user.save();
  }
  return user;
}

// Função para atualizar acertos e erros após cada quiz
export async function updateUserScore(
  discordId: string,
  guildId: string,
  correct: number,
  wrong: number
): Promise<void> {
  const user = await User.findOne({ discordId, guildId });
  if (user) {
    user.quizzesPlayed += 1;
    user.correctAnswers += correct;
    user.wrongAnswers += wrong;
    await user.save();
  }
}

// Função para obter o ranking de um servidor específico
export async function getRanking(guildId: string): Promise<IUser[]> {
  return await User.find({ guildId }).sort({ correctAnswers: -1 }).limit(10);
}
