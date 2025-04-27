import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env.local' });  // 明示的に`.env.local`を読み込む
  } else {
    dotenv.config();  // 本番環境では`.env`を自動的に読み込む
  }
const prisma = new PrismaClient();
export default prisma;
