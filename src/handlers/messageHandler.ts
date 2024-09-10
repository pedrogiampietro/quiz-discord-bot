import { Client, GatewayIntentBits } from "discord.js";
import {
  getQuestionFromGemini,
  markQuizAsPlayed,
  startQuizForUser,
} from "../services/quizService";
import {
  findOrCreateUser,
  updateUserScore,
  getRanking,
} from "../services/userService";

// Configura o cliente do Discord
export function setupDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
  });

  client.once("ready", () => {
    console.log(`Bot está online como ${client.user?.tag}`);
  });

  // Lidar com o evento de mensagem
  client.on("messageCreate", async (message: any) => {
    const guildId = message.guild.id;
    const userId = message.author.id;

    if (message.content === "!quiz") {
      const quiz = await startQuizForUser(userId);

      if (quiz) {
        // Enviar a pergunta e as opções de resposta para o canal
        const answersText = quiz.answers
          .map(
            (answer: any, index: number) => `${index + 1}. ${answer.content}`
          )
          .join("\n");

        const sentMessage = await message.channel.send(
          `**Pergunta:** ${quiz.content}\n${answersText}\n\nReaja com o número correspondente para votar!`
        );

        const reactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
        for (let i = 0; i < quiz.answers.length; i++) {
          await sentMessage.react(reactions[i]);
        }

        const filter = (reaction: any, user: any) =>
          reactions.includes(reaction.emoji.name) && !user.bot;

        const voteCounts = [0, 0, 0, 0];
        const voters = [[], [], [], []] as any;

        const collector = sentMessage.createReactionCollector({
          filter,
          time: 20000,
        });

        // Coletar as reações e contar votos
        collector.on("collect", async (reaction: any, user: any) => {
          try {
            const fetchedUser = await user.fetch();

            for (let i = 0; i < voters.length; i++) {
              if (voters[i].some((voter: any) => voter.id === fetchedUser.id)) {
                return; // O usuário já votou, ignorar múltiplos votos
              }
            }

            const reactionIndex = reactions.indexOf(reaction.emoji.name);
            if (reactionIndex !== -1) {
              voteCounts[reactionIndex] += 1;
              voters[reactionIndex].push({
                id: fetchedUser.id,
                username: fetchedUser.username,
              });
            }

            await findOrCreateUser(
              fetchedUser.id,
              guildId,
              fetchedUser.username
            );
          } catch (error) {
            console.error("Erro ao coletar reação ou criar usuário:", error);
          }
        });

        // Ao finalizar o quiz
        collector.on("end", async () => {
          let correctIndex = quiz.answers.findIndex(
            (answer: any) => answer.isCorrect
          );
          let resultMessage = "**Resultados da Enquete:**\n";
          for (let i = 0; i < quiz.answers.length; i++) {
            const correctMark = quiz.answers[i].isCorrect ? "✅" : "";
            const voterNames =
              voters[i].length > 0
                ? ` (${voters[i]
                    .map((voter: any) => voter.username)
                    .join(", ")})`
                : "";

            resultMessage += `${i + 1}. ${quiz.answers[i].content} - **${
              voteCounts[i]
            } votos** ${correctMark}${voterNames}\n`;

            for (const voter of voters[i]) {
              const discordUser = await findOrCreateUser(
                voter.id,
                guildId,
                voter.username
              );
              await updateUserScore(
                discordUser.discordId,
                guildId,
                i === correctIndex ? 1 : 0,
                i !== correctIndex ? 1 : 0
              );
            }
          }

          // Enviar os resultados
          await message.channel.send(resultMessage);
          await message.channel.send(
            "Tempo esgotado! A enquete foi encerrada."
          );

          // Marcar o quiz como jogado para o usuário após o fim da votação
          await markQuizAsPlayed(userId, quiz._id);
        });
      }
    }

    // Comando para exibir o ranking de um servidor específico
    if (message.content === "!ranking") {
      const ranking = await getRanking(guildId);
      let rankingMessage = "**Ranking dos Top Jogadores**\n";
      ranking.forEach((user, index) => {
        rankingMessage += `${index + 1}. ${user.username} - ${
          user.correctAnswers
        } acertos\n`;
      });
      await message.channel.send(rankingMessage);
    }
  });

  return client;
}
