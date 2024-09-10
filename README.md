
# Tibia Quiz Bot 🎮🐉

O **Tibia Quiz Bot** é um bot interativo para Discord que gera quizzes sobre o famoso MMORPG *Tibia*. Ele utiliza a API do Google Gemini AI para gerar perguntas automaticamente, com foco em criaturas, itens, locais, NPCs e mecânicas que existem no universo oficial do Tibia. Todas as perguntas e respostas são baseadas em informações reais extraídas do [TibiaWiki](https://tibiawiki.com.br/).

## Funcionalidades

- **Perguntas sobre Criaturas**: Descubra criaturas de Tibia, seus loots, habitats e características.
- **Itens**: Teste seu conhecimento sobre itens raros e poderosos, e quais monstros os dropam.
- **Locais e Cidades**: Explore cidades e áreas de caça do Tibia.
- **NPCs**: Perguntas sobre personagens não-jogadores, suas missões e funcionalidades.
- **Mecânicas do Jogo**: Questões sobre PvP, quests e eventos de Tibia.

## Tecnologias Utilizadas

- **Node.js**: Backend do bot.
- **Discord.js**: Interação com o Discord para o envio e recepção de mensagens.
- **Google Gemini AI**: Geração de perguntas dinâmicas e inteligentes.
- **MongoDB**: Armazenamento dos quizzes e histórico de quizzes jogados pelos usuários.
- **TibiaWiki**: Fonte de informações validadas sobre o jogo Tibia.

## Como Funciona

1. **Comando !quiz**: Um usuário envia o comando `!quiz` no Discord.
2. **Verificação de Quiz**: O bot verifica no banco de dados se o usuário já jogou quizzes existentes.
   - Caso haja um quiz não jogado, ele é enviado.
   - Caso o usuário já tenha jogado todos os quizzes existentes, um novo quiz é gerado via Google Gemini AI.
3. **Interação**: O bot coleta as respostas dos usuários através de reações no Discord.
4. **Resultados**: O bot envia os resultados da enquete e atualiza o histórico do usuário.

## Como Configurar

1. Clone o repositório:

   ```bash
   git clone https://github.com/pedrogiampietro/quiz-discord-bot.git
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   Crie um arquivo `.env` e adicione as seguintes variáveis:

   ```env
   DISCORD_TOKEN=seu_token_do_discord
   MONGO_URI=sua_url_do_mongodb
   GOOGLE_API_KEY=sua_chave_da_google_api
   ```

4. Inicie o bot:

   ```bash
   npm start
   ```

## Como Contribuir

1. Faça um fork do projeto.
2. Crie uma nova branch para suas alterações:

   ```bash
   git checkout -b minha-feature
   ```

3. Envie suas alterações:

   ```bash
   git push origin minha-feature
   ```

4. Abra um Pull Request e descreva suas mudanças!

## Licença

Este projeto é licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ Pedro Giampietro.
