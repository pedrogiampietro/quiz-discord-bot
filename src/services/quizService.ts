import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/gemini";

const genAI = new GoogleGenerativeAI(config.googleApiKey);
const googleAIClient = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getQuestionFromGemini() {
  const prompt = `
  Crie um quiz sobre o jogo 'Tibia', utilizando exclusivamente informações baseadas no TibiaWiki. Todas as perguntas e respostas devem ser validadas com base nas informações reais disponíveis no TibiaWiki. 
  As perguntas devem ser focadas em criaturas, itens, locais ou mecânicas que realmente existem no universo de Tibia, e devem utilizar nomes e descrições exatamente como aparecem no TibiaWiki. Evite criar perguntas sobre criaturas inexistentes, como 'Infernal Scarab', ou itens que não estão associados corretamente às criaturas. 
  Não inclua informações fictícias ou inventadas. Certifique-se de que as criaturas mencionadas nas respostas estão de acordo com o jogo oficial e que as opções de resposta incorretas ainda sejam plausíveis e relacionadas ao tema.
  Exemplo de saída formatada como JSON válido:

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
  }
  Lembre-se de garantir que todos os itens, criaturas e locais mencionados nas perguntas e respostas sejam corretamente validados com o TibiaWiki e existam no universo oficial do jogo Tibia.`;

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
