import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';
import dotenv from 'dotenv';

dotenv.config();

// Configurar OpenAI con manejo de errores mejorado
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('La variable de entorno OPENAI_API_KEY no está definida')
  }

  openai = new OpenAI({ apiKey });
  console.log('OpenAI configurado correctamente');
} catch (error) {
  console.error('Error al inicializar OpenAI:', error);
}

// Generar respuesta de ChatGPT
export const generateChatResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El prompt es requerido' });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: 'No se ha configurado correctamente la API de OpenAI',
        message: 'Error interno del servidor al configurar OpenAI'
      });
    }

    // Llamada a la API de OpenAI con modelo gpt-4o para respuestas más avanzadas
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Eres un asistente amigable y útil. Tus respuestas deben ser concisas (máximo 100 palabras), claras e incluir emojis relevantes. Usa párrafos cortos para mejor legibilidad." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 300, // Limitar tokens para respuestas más cortas
      temperature: 0.7, // Mantener algo de creatividad
    });

    const response = completion.choices[0].message.content;

    // Guardar la conversación en la base de datos
    const conversation = new Conversation({
      prompt,
      response,
    });

    await conversation.save();

    res.json({ response });
  } catch (error) {
    console.error('Error al generar la respuesta:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      details: error.message 
    });
  }
};

// Obtener historial de conversaciones
export const getConversationHistory = async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ createdAt: -1 }).limit(10);
    res.json(conversations);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial de conversaciones' });
  }
};

export const generateTrivia = async (req, res) => {
  const { tema } = req.body;
  console.log("🎯 Tema recibido:", tema);

  if (!tema) {
    return res.status(400).json({ error: 'El tema es requerido' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un generador de preguntas tipo trivia. Devuelve exclusivamente un arreglo JSON con 5 preguntas, cada una con 4 opciones y una respuesta correcta. NO incluyas texto explicativo."
        },
        {
          role: "user",
          content: `Crea una trivia con 5 preguntas sobre el tema "${tema}". Devuélvelo estrictamente como JSON con esta estructura:

[
  {
    "pregunta": "¿Texto?",
    "opciones": {
      "A": "Texto",
      "B": "Texto",
      "C": "Texto",
      "D": "Texto"
    },
    "respuesta_correcta": "A"
  },
  ...
]`
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const rawResponse = completion.choices[0].message.content;
    console.log("📦 Respuesta cruda de GPT:\n", rawResponse);

    // Intenta extraer JSON incluso si GPT lo envolvió con texto
    const match = rawResponse.match(/\[\s*{[\s\S]*?}\s*\]/);

    if (!match) {
      console.error('No se pudo encontrar un bloque JSON en la respuesta');
      return res.status(500).json({
        error: 'GPT no devolvió un JSON válido',
        raw: rawResponse
      });
    }

    const parsedTrivia = JSON.parse(match[0]);
    res.json({ trivia: parsedTrivia });

  } catch (error) {
    console.error('Error interno al generar trivia:', error.message);
    res.status(500).json({ 
      error: 'Fallo al procesar la trivia', 
      detalle: error.message 
    });
  }
};
