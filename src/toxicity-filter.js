import * as toxicity from '@tensorflow-models/toxicity';


const THRESHOLD = 0.0;

let model;

export async function loadModel() {
  if (model) {
    return;
  }
  try {
    model = await toxicity.load(THRESHOLD, ['toxicity', 'insult', 'threat', 'sexual_explicit']);
    console.log('[IA] Modelo de Toxicidade carregado com sucesso.');
  } catch (error) {
    console.error('[IA] Falha ao carregar o modelo:', error);
  }
}

export async function isToxic(message) {
  if (!model) {
    console.log('[IA] Modelo ainda não está pronto. Mensagem liberada.');
    return false;
  }

  console.log(`[IA] A verificar a frase: "${message}"`);
  const predictions = await model.classify([message]);

  predictions.forEach(p => {
    console.log(`[IA] Categoria: ${p.label}, Probabilidade: ${p.results[0].probabilities[1].toFixed(3)}`);
  });

  for (const prediction of predictions) {
    if (prediction.results[0].match) {
      console.log(`[IA] MENSAGEM BLOQUEADA. Categoria: ${prediction.label}`);
      return true;
    }
  }

  console.log('[IA] Mensagem liberada pela IA.');
  return false;
}