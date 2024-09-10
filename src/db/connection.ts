import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Conectado ao MongoDB Atlas");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB Atlas", error);
  }
}
