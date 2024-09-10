import { Client, GatewayIntentBits } from "discord.js";
import { getQuestionFromGemini } from "../services/quizService";
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
    const guildId = message.guild.id; // Obter o ID do servidor (guildId)

    if (message.content === "!tibiaquiz") {
      const question = await getQuestionFromGemini();

      if (question && question.quiz && question.quiz.questions.length > 0) {
        const quizQuestion = question.quiz.questions[0];
        const questionText = quizQuestion.content;
        const answers = quizQuestion.answers
          .map(
            (answer: any, index: number) => `${index + 1}. ${answer.content}`
          )
          .join("\n");

        // Enviando a pergunta e as opções de resposta
        const sentMessage = await message.channel.send(
          `**Pergunta:** ${questionText}\n${answers}\n\nReaja com o número correspondente para votar!`
        );

        const reactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
        for (let i = 0; i < quizQuestion.answers.length; i++) {
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
          const index = reactions.indexOf(reaction.emoji.name);
          if (index !== -1) {
            voteCounts[index] += 1;
            voters[index].push(user.username);

            // Criar ou encontrar o usuário, considerando guildId
            const discordUser = await findOrCreateUser(
              user.id,
              guildId,
              user.username
            );
          }
        });

        // Exibe os resultados e atualiza as estatísticas
        collector.on("end", async () => {
          let correctIndex = quizQuestion.answers.findIndex(
            (answer: any) => answer.isCorrect
          );
          let resultMessage = "**Resultados da Enquete:**\n";
          for (let i = 0; i < quizQuestion.answers.length; i++) {
            const correctMark = quizQuestion.answers[i].isCorrect ? "✅" : "";
            const voterNames =
              voters[i].length > 0 ? ` (${voters[i].join(", ")})` : "";
            resultMessage += `${i + 1}. ${
              quizQuestion.answers[i].content
            } - **${voteCounts[i]} votos** ${correctMark}${voterNames}\n`;

            // Atualizar as estatísticas dos usuários, considerando guildId
            for (const username of voters[i]) {
              await updateUserScore(
                username,
                guildId, // Passa o guildId para atualizar corretamente por servidor
                i === correctIndex ? 1 : 0, // Acertos
                i !== correctIndex ? 1 : 0 // Erros
              );
            }
          }

          // Enviar os resultados
          await message.channel.send(resultMessage);
          await message.channel.send(
            "Tempo esgotado! A enquete foi encerrada."
          );
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
