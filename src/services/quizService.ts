import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/gemini";

const genAI = new GoogleGenerativeAI(config.googleApiKey);
const googleAIClient = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getQuestionFromGemini() {
  const prompt = `Crie um quiz sobre o tema 'Tibia', um jogo MMORPG 2D online, utilizando exclusivamente informações baseadas nos nomes e descrições oficiais do TibiaWiki. As perguntas devem ser sobre o jogo Tibia, abrangendo itens, criaturas, habilidades e mecânicas do jogo, com nomes e descrições exatos como aparecem no TibiaWiki.
  As perguntas devem variar de forma criativa sempre que o tema for solicitado novamente, evitando repetições de perguntas anteriores. As perguntas devem ser diretas e concisas, levando a respostas com até uma frase. Inclua opções de resposta que sejam plausíveis, mas também variadas, para evitar padrões previsíveis. Evite informações muito comuns ou amplamente conhecidas, dando preferência a detalhes do jogo que aparecem no TibiaWiki.
  O quiz deve conter 1 pergunta, com 4 opções de resposta, sendo apenas uma a correta, vamos sortear qual posição vai estar a pergunta correta. Formate a saída como um JSON válido, sem markdown, conforme o exemplo abaixo: 
  {
    "quiz": {
      "questions": [
        {
          "content": "Pergunta 1",
          "answers": [
            {"content": "Opção 1", "isCorrect": false},
            {"content": "Opção 2", "isCorrect": true},
            {"content": "Opção 3", "isCorrect": false},
            {"content": "Opção 4", "isCorrect": false}
          ]
        }
      ]
    }
  }`;

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
