import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const openai = new OpenAI();

const knowledge = readFileSync(join(__dirname, '..', 'context', 'bucketsai_knowledge.md'), 'utf-8');

async function callLLM(systemPrompt, userPrompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  const text = response.choices[0].message.content.trim();
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No se pudo parsear respuesta del LLM: ' + text.slice(0, 300));
  }
}

export async function buildContent(empresa, pais, idioma, enfoque, researchData, infoExtra) {
  const systemPrompt = `Eres un experto en sales enablement B2B para BucketsAI. Generas casos de uso de venta precisos, concretos y especificos para cada empresa. Nunca uses emojis, guiones largos ni tildes. Todo en lenguaje directo.`;

  // --- Llamada 1: Secciones base ---
  console.log('   Generando secciones base...');
  const paisLabel = pais ? ` (${pais})` : '';
  const base = await callLLM(systemPrompt, `Genera el contenido base del caso de uso de BucketsAI para la empresa ${empresa}${paisLabel}.

CONOCIMIENTO DE BUCKETSAI:
${knowledge}

DATOS DE LA EMPRESA:
${JSON.stringify(researchData, null, 2)}

INFO EXTRA DEL USUARIO: ${infoExtra || 'ninguna'}
IDIOMA: ${idioma}
ENFOQUE PREFERIDO: ${enfoque}

Devuelve SOLO este JSON sin backticks:
{
  "titulo_caso": "subtitulo del documento (describe en 10-12 palabras el caso central)",
  "terminos_simples": "BucketsAI es el ChatGPT interno de ${empresa}, conectado a [sus sistemas y documentos clave].",
  "paso1_cuerpo": "2 oraciones sobre que documentos carga ${empresa} en BucketsAI",
  "paso2_titulo": "Se integra con [sistemas especificos de esta empresa]",
  "paso2_cuerpo": "2 oraciones sobre que sistemas/datos se conectan en este contexto",
  "paso3_cuerpo": "2 oraciones sobre gobernanza especifica para esta empresa",
  "paso4_cuerpo": "2 oraciones sobre como usan el sistema los empleados de ${empresa}",
  "problema_headline": "frase impactante de 15-20 palabras sobre el reto central de ${empresa} con datos reales",
  "segunda_dimension_titulo": "titulo de la segunda dimension del problema (1 oracion)",
  "segunda_dimension_cuerpo": "2-3 oraciones sobre el segundo problema especifico que BucketsAI resuelve",
  "intro_caso": "2 oraciones sobre como BucketsAI opera en 2 dimensiones dentro de ${empresa}",
  "kpis": [
    {"val": "[dato real de la empresa]", "label": "[etiqueta]"},
    {"val": "[dato real de la empresa]", "label": "[etiqueta]"},
    {"val": "[dato real de la empresa]", "label": "[etiqueta]"},
    {"val": "2", "label": "Dimensiones de valor"}
  ],
  "dim_a_id": "ventas_tat|ventas_comerciales|operaciones_tiendas|customer_success|training",
  "dim_a_titulo": "titulo de la dimension A (5-7 palabras)",
  "dim_a_descripcion": "descripcion de dimension A (2 oraciones, especifica para ${empresa})",
  "dim_a_rol": "rol del que hace preguntas en dimension A",
  "dim_b_id": "canal_moderno|postventa|distribucion_red|trade_marketing",
  "dim_b_titulo": "titulo de la dimension B (5-7 palabras)",
  "dim_b_descripcion": "descripcion de dimension B (2 oraciones, especifica para ${empresa})",
  "dim_b_rol": "rol del que hace preguntas en dimension B"
}`);

  // --- Llamada 2: Casos A ---
  console.log('   Generando casos Dimension A...');
  const casosA = await callLLM(systemPrompt, `Genera los 3 casos conversacionales de la Dimension A para ${empresa}.
Idioma: ${idioma}. Sin tildes, sin guiones largos, sin emojis.

DATOS DE LA EMPRESA: ${JSON.stringify(researchData, null, 2)}
DIMENSION A: ${base.dim_a_titulo} — Rol: ${base.dim_a_rol}

REGLAS CRITICAS:
- A1: el ${base.dim_a_rol} necesita saber QUE HACER AHORA (prioridades en tiempo real)
- A2: ampliacion de pedido/ticket con cross-selling basado en patrones reales
- A3: manejo de objecion especifica del sector de ${empresa}
- Las preguntas DEBEN incluir nombres reales de productos/lugares/situaciones de ${empresa}
- Las respuestas DEBEN tener datos especificos: porcentajes, cantidades, nombres reales

Devuelve SOLO este JSON sin backticks:
{
  "a1_titulo": "titulo 4-5 palabras",
  "a1_setup": "1 oracion setup",
  "a1_pregunta": "pregunta realista del ${base.dim_a_rol} con contexto especifico",
  "a1_label": "titulo de la respuesta BucketsAI",
  "a1_bullets": ["bullet 1 con dato especifico", "bullet 2", "bullet 3", "bullet 4"],

  "a2_titulo": "titulo 4-5 palabras",
  "a2_setup": "1 oracion setup",
  "a2_pregunta": "pregunta sobre que mas ofrecer o como ampliar",
  "a2_label": "titulo de la respuesta",
  "a2_bullets": ["bullet 1", "bullet 2", "bullet 3"],

  "a3_titulo": "titulo 4-5 palabras",
  "a3_setup": "1 oracion sobre manejo de objeciones",
  "a3_pregunta": "pregunta sobre objecion especifica del sector de ${empresa}",
  "a3_label": "titulo de la respuesta",
  "a3_bullets": ["argumento 1 con dato especifico", "argumento 2", "argumento 3", "argumento 4"]
}`);

  // --- Llamada 3: Casos B + Propuesta ---
  console.log('   Generando casos Dimension B y propuesta de valor...');
  const casosB = await callLLM(systemPrompt, `Genera los 3 casos de Dimension B y la propuesta de valor para ${empresa}.
Idioma: ${idioma}. Sin tildes, sin guiones largos, sin emojis.

DATOS DE LA EMPRESA: ${JSON.stringify(researchData, null, 2)}
DIMENSION B: ${base.dim_b_titulo} — Rol: ${base.dim_b_rol}

REGLAS CRITICAS:
- B1: ejecucion segun estandar de marca (el empleado del punto de contacto)
- B2: alerta urgente / quiebre / situacion que hay que resolver AHORA
- B3: pregunta de gerente/director sobre visibilidad de toda la red
- Usar nombres reales de productos, tiendas, zonas de ${empresa}

Devuelve SOLO este JSON sin backticks:
{
  "b1_titulo": "titulo 4-5 palabras",
  "b1_setup": "1 oracion setup",
  "b1_rol": "Empleado de [lugar especifico]",
  "b1_pregunta": "pregunta sobre como ejecutar segun estandar",
  "b1_label": "titulo de la respuesta",
  "b1_bullets": ["instruccion 1", "instruccion 2", "instruccion 3", "instruccion 4", "accion de seguimiento"],

  "b2_titulo": "titulo 4-5 palabras",
  "b2_setup": "1 oracion sobre alertas urgentes",
  "b2_rol": "Empleado del punto",
  "b2_pregunta": "pregunta sobre que atender urgente",
  "b2_label": "titulo de la respuesta",
  "b2_bullets": ["alerta 1 con datos", "alerta 2", "accion recomendada concreta"],

  "b3_titulo": "titulo 4-5 palabras",
  "b3_setup": "1 oracion sobre visibilidad para gerencia",
  "b3_rol": "Gerente / Director de [area]",
  "b3_pregunta": "pregunta de vision panoramica del director",
  "b3_label": "Resumen de [area]:",
  "b3_bullets": ["dato de red completa", "dato de incumplimiento", "zonas/unidades especificas", "impacto estimado"],

  "propuesta": [
    ["beneficio 1 (3-4 palabras)", "descripcion concreta para ${empresa} (1 oracion)"],
    ["beneficio 2", "descripcion concreta"],
    ["beneficio 3", "descripcion concreta"],
    ["beneficio 4", "descripcion concreta"],
    ["beneficio 5", "descripcion concreta"],
    ["beneficio 6", "descripcion concreta"]
  ]
}`);

  return { empresa, ...base, ...casosA, ...casosB };
}
