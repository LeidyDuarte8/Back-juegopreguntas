// server-check.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Carga variables desde .env

const MONGO_URI = process.env.MONGO_URI;

console.log("🔌 Probando conexión con URI:", MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Conexión a MongoDB establecida correctamente');
    process.exit(0); // Salir sin error
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1); // Salir con error
  });
