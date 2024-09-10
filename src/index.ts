import dotenv from "dotenv";
import { setupDiscordClient } from "./handlers/messageHandler";
import { connectToDatabase } from "./db/connection";

dotenv.config();

// Conectar ao banco de dados
connectToDatabase();

// Iniciar o cliente Discord
const client = setupDiscordClient();
client.login(process.env.DISCORD_TOKEN);
