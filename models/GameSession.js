import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  topic: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  answers: [
    {
      pregunta: String,
      seleccionada: String,
      correcta: String
    }
  ]
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);
export default GameSession;
