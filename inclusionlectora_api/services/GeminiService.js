// CommonJS compatible
const enviarAGemini = async (imageBuffer, prompt) => {
    const { GoogleGenerativeAI } = await import('@google/generative-ai'); // 👈 uso dinámico
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
    const base64Image = imageBuffer.toString('base64');
  
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
    const result = await model.generateContent({
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          }
        ]
      }]
    });
  
    const response = await result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo extraer contenido.';
    return text;
  };
  
  module.exports = { enviarAGemini };
  