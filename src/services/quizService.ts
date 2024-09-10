import { Quiz } from "../models/quizModel";
import { UserQuiz } from "../models/historyQuiz";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/gemini";

const genAI = new GoogleGenerativeAI(config.googleApiKey);
const googleAIClient = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Função para salvar o quiz no banco de dados
export async function saveQuizToDatabase(quizData: any) {
  const quiz = new Quiz({
    content: quizData.content,
    answers: quizData.answers,
  });

  await quiz.save();
  return quiz;
}

// Função para verificar se o usuário já jogou um quiz
export async function hasUserPlayedQuiz(userId: string, quizId: string) {
  const result = await UserQuiz.findOne({ userId, quizId });
  return result !== null;
}

// Função para buscar um quiz que o usuário ainda não jogou
export async function getUnplayedQuizForUser(userId: string) {
  // Buscar todos os quizzes jogados pelo usuário
  const playedQuizIds = await UserQuiz.find({ userId }).select("quizId");
  const playedIds = playedQuizIds.map((doc) => doc.quizId);

  // Buscar um quiz que o usuário ainda não jogou
  const unplayedQuiz = await Quiz.findOne({ _id: { $nin: playedIds } });
  return unplayedQuiz;
}

// Função para marcar o quiz como jogado
export async function markQuizAsPlayed(userId: string, quizId: string) {
  const userQuiz = new UserQuiz({
    userId,
    quizId,
  });

  await userQuiz.save();
}

// Função para gerar um novo quiz usando o Gemini AI
export async function getQuestionFromGemini() {
  const prompt = `
 Você é responsável por criar um quiz sobre o jogo 'Tibia', utilizando apenas informações reais e verificáveis do TibiaWiki. Aqui estão as regras específicas para a geração do quiz:

1. Todas as perguntas devem ser sobre criaturas, itens, locais, NPCs ou mecânicas do jogo 'Tibia' e **devem existir oficialmente no jogo**.
2. **Todas as informações** utilizadas nas perguntas e respostas devem ser baseadas exclusivamente no TibiaWiki, garantindo precisão e veracidade.
3. As perguntas devem estar nas seguintes categorias:
   - **Criaturas**: Perguntas sobre monstros, bosses, seus habitats, habilidades e itens de loot.
   - **Itens**: Armaduras, armas, itens mágicos e raros. Perguntas sobre quais criaturas dropam esses itens ou onde podem ser encontrados.
   - **Locais**: Perguntas sobre cidades e áreas de caça do Tibia, suas características e história.
   - **NPCs**: Perguntas sobre NPCs, suas funções (comércio, missões, etc.) e localização.
   - **Mecânicas do jogo**: Perguntas sobre sistemas como PvP, quests, eventos e invasões.
4. **Proibições**:
   - **Não inclua itens, criaturas ou informações fictícias** que não existam no Tibia, como 'Dragon Helmet' ou 'Infernal Scarab'.
   - **Evite informações genéricas ou vagas**. As perguntas devem ser específicas e baseadas no universo do Tibia.
5. **Estrutura de resposta**:
   - Cada pergunta deve ter 4 opções de resposta, sendo apenas uma correta.
   - As respostas erradas devem ser **plausíveis** dentro do universo de Tibia, mas claramente incorretas.
   - Use nomes e descrições exatos conforme encontrados no TibiaWiki.

Formato de saída: JSON válido.

### Exemplo de Saída:

{
  "quiz": {
    "questions": [
      {
        "content": "Qual criatura dropa o item 'Dragon Shield'?",
        "answers": [
          {"content": "Dragon Lord", "isCorrect": true},
          {"content": "Fire Elemental", "isCorrect": false},
          {"content": "Wyrm", "isCorrect": false},
          {"content": "Cyclops", "isCorrect": false}
        ]
      }
    ]
  }
}

  `;

  try {
    const result = await googleAIClient.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Erro ao obter pergunta do Gemini:", error);
    return null;
  }
}

// Função principal para iniciar o quiz
export async function startQuizForUser(userId: string) {
  // Buscar um quiz não jogado
  let quiz = (await getUnplayedQuizForUser(userId)) as any;

  if (quiz) {
    // Se existir um quiz não jogado no banco de dados, enviar esse quiz
    return quiz;
  } else {
    // Se todos os quizzes do banco já foram jogados, gerar um novo quiz
    const newQuizData = await getQuestionFromGemini();
    if (
      newQuizData &&
      newQuizData.quiz &&
      newQuizData.quiz.questions.length > 0
    ) {
      quiz = newQuizData.quiz.questions[0];

      // Salvar o novo quiz no banco de dados
      const savedQuiz = (await saveQuizToDatabase(quiz)) as any;
      quiz._id = savedQuiz._id;

      // Marcar o quiz gerado como jogado para o usuário
      await markQuizAsPlayed(userId, savedQuiz._id);

      return quiz;
    }
  }

  return null; // Caso não haja quizzes ou erro na geração
}
