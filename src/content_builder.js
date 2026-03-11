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
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt + ' Responde SIEMPRE en formato JSON valido.' },
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

export async function buildContent(empresa, pais, idioma, enfoque, researchData, infoExtra, targetMode = 'company') {
  const isIndustry = targetMode === 'industry';
  const systemPrompt = isIndustry
    ? `Eres un experto en sales enablement B2B para BucketsAI. Generas casos de uso de venta genericos para una INDUSTRIA o SECTOR, no para una empresa especifica. El contenido debe aplicar a cualquier empresa del sector. Usa ejemplos tipicos del sector con nombres ficticios si necesitas ilustrar. Nunca uses emojis, guiones largos ni tildes. Todo en lenguaje directo.`
    : `Eres un experto en sales enablement B2B para BucketsAI. Generas casos de uso de venta precisos, concretos y especificos para cada empresa. Nunca uses emojis, guiones largos ni tildes. Todo en lenguaje directo.`;

  // --- Llamada 1: Secciones base ---
  console.log('   Generando secciones base...');
  const paisLabel = pais ? ` (${pais})` : '';
  const paisConstraint = pais
    ? `\n\nRESTRICCION DE PAIS: TODO el contenido debe ser especifico para ${pais}. Usa nombres de ciudades, zonas, tiendas y datos que correspondan UNICAMENTE a ${pais}. NO menciones ciudades, datos ni operaciones de otros paises.${isIndustry ? '' : ' Si la empresa opera globalmente, enfocate solo en su operacion en ' + pais + '.'}`
    : '';
  const enfoqueConstraint = enfoque
    ? `\nENFOQUE DEL CASO: El caso de uso debe centrarse en "${enfoque}". Las dimensiones, casos conversacionales y ejemplos deben estar alineados con este enfoque especifico.`
    : '';
  const industryConstraint = isIndustry
    ? `\n\nMODO INDUSTRIA: Este caso de uso es GENERICO para toda la industria "${empresa}". NO nombres ninguna empresa real especifica como protagonista. Usa frases como "una empresa tipica del sector ${empresa}", "los equipos de [rol] en ${empresa}", "una aseguradora/banco/retailer tipico". Puedes mencionar empresas reales como REFERENCIAS del sector (ej: "como lo hacen empresas como X o Y"), pero el caso debe aplicar a CUALQUIER empresa del sector.`
    : '';

  const targetLabel = isIndustry ? `la industria ${empresa}` : `la empresa ${empresa}`;

  const base = await callLLM(systemPrompt, `Genera el contenido base del caso de uso de BucketsAI para ${targetLabel}${paisLabel}.

CONOCIMIENTO DE BUCKETSAI:
${knowledge}

DATOS DE LA EMPRESA:
${JSON.stringify(researchData, null, 2)}

INFO EXTRA DEL USUARIO: ${infoExtra || 'ninguna'}
IDIOMA: ${idioma}
ENFOQUE PREFERIDO: ${enfoque}${paisConstraint}${enfoqueConstraint}${industryConstraint}

Devuelve SOLO este JSON sin backticks:
{
  "titulo_caso": "subtitulo del documento (describe en 10-12 palabras el caso central${isIndustry ? ' para el sector' : ''})",
  "terminos_simples": "BucketsAI es el ChatGPT interno de ${isIndustry ? 'empresas del sector ' + empresa : empresa}, conectado a [${isIndustry ? 'los' : 'sus'} sistemas y documentos clave].",
  "paso1_cuerpo": "2 oraciones sobre que documentos ${isIndustry ? 'cargan las empresas del sector' : 'carga ' + empresa} en BucketsAI",
  "paso2_titulo": "Se integra con [sistemas ${isIndustry ? 'tipicos del sector' : 'especificos de esta empresa'}]",
  "paso2_cuerpo": "2 oraciones sobre que sistemas/datos se conectan en este contexto",
  "paso3_cuerpo": "2 oraciones sobre gobernanza ${isIndustry ? 'tipica del sector' : 'especifica para esta empresa'}",
  "paso4_cuerpo": "2 oraciones sobre como usan el sistema los empleados ${isIndustry ? 'del sector' : 'de ' + empresa}",
  "problema_headline": "frase impactante de 15-20 palabras sobre el reto central ${isIndustry ? 'del sector ' + empresa : 'de ' + empresa} con datos reales",
  "segunda_dimension_titulo": "titulo de la segunda dimension del problema (1 oracion)",
  "segunda_dimension_cuerpo": "2-3 oraciones sobre el segundo problema ${isIndustry ? 'tipico del sector' : 'especifico'} que BucketsAI resuelve",
  "intro_caso": "2 oraciones sobre como BucketsAI opera en 2 dimensiones ${isIndustry ? 'en el sector ' + empresa : 'dentro de ' + empresa}",
  "kpis": [
    {"val": "[dato real ${isIndustry ? 'del sector' : 'de la empresa'}]", "label": "[etiqueta]"},
    {"val": "[dato real ${isIndustry ? 'del sector' : 'de la empresa'}]", "label": "[etiqueta]"},
    {"val": "[dato real ${isIndustry ? 'del sector' : 'de la empresa'}]", "label": "[etiqueta]"},
    {"val": "2", "label": "Dimensiones de valor"}
  ],
  "dim_a_id": "ventas_tat|ventas_comerciales|operaciones_tiendas|customer_success|training",
  "dim_a_titulo": "titulo de la dimension A (5-7 palabras)",
  "dim_a_descripcion": "descripcion de dimension A (2 oraciones, ${isIndustry ? 'generica para el sector' : 'especifica para ' + empresa})",
  "dim_a_rol": "rol del que hace preguntas en dimension A${isIndustry ? ' (rol tipico del sector)' : ''}",
  "dim_b_id": "canal_moderno|postventa|distribucion_red|trade_marketing",
  "dim_b_titulo": "titulo de la dimension B (5-7 palabras)",
  "dim_b_descripcion": "descripcion de dimension B (2 oraciones, ${isIndustry ? 'generica para el sector' : 'especifica para ' + empresa})",
  "dim_b_rol": "rol del que hace preguntas en dimension B${isIndustry ? ' (rol tipico del sector)' : ''}"
}`);

  // --- Llamada 2: Casos A ---
  console.log('   Generando casos Dimension A...');
  const casosA = await callLLM(systemPrompt, `Genera los 3 casos conversacionales de la Dimension A para ${targetLabel}${paisLabel}.
Idioma: ${idioma}. Sin tildes, sin guiones largos, sin emojis.

DATOS ${isIndustry ? 'DE LA INDUSTRIA' : 'DE LA EMPRESA'}: ${JSON.stringify(researchData, null, 2)}
DIMENSION A: ${base.dim_a_titulo} — Rol: ${base.dim_a_rol}
${industryConstraint}
REGLAS CRITICAS:
- A1: el ${base.dim_a_rol} necesita saber QUE HACER AHORA (prioridades en tiempo real)
- A2: ampliacion de pedido/ticket con cross-selling basado en patrones reales
- A3: manejo de objecion especifica del sector ${isIndustry ? empresa : 'de ' + empresa}
- Las preguntas DEBEN incluir nombres ${isIndustry ? 'tipicos de productos/lugares/situaciones del sector' : 'reales de productos/lugares/situaciones de ' + empresa}${pais ? ` en ${pais}` : ''}
- Las respuestas DEBEN tener datos especificos: porcentajes, cantidades, nombres ${isIndustry ? 'representativos' : 'reales'}${pais ? `\n- TODOS los escenarios, ciudades, tiendas y referencias geograficas deben ser de ${pais}. NO menciones ciudades ni datos de otros paises.` : ''}${enfoque ? `\n- El enfoque del caso es "${enfoque}". Los escenarios deben estar alineados con este enfoque.` : ''}

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
  const casosB = await callLLM(systemPrompt, `Genera los 3 casos de Dimension B y la propuesta de valor para ${targetLabel}${paisLabel}.
Idioma: ${idioma}. Sin tildes, sin guiones largos, sin emojis.

DATOS ${isIndustry ? 'DE LA INDUSTRIA' : 'DE LA EMPRESA'}: ${JSON.stringify(researchData, null, 2)}
DIMENSION B: ${base.dim_b_titulo} — Rol: ${base.dim_b_rol}
${industryConstraint}
REGLAS CRITICAS:
- B1: ejecucion segun estandar de marca (el empleado del punto de contacto)
- B2: alerta urgente / quiebre / situacion que hay que resolver AHORA
- B3: pregunta de gerente/director sobre visibilidad de toda la red
- Usar nombres ${isIndustry ? 'tipicos de productos, tiendas, zonas del sector' : 'reales de productos, tiendas, zonas de ' + empresa}${pais ? ` en ${pais}` : ''}${pais ? `\n- TODOS los escenarios, ciudades, tiendas y referencias geograficas deben ser de ${pais}. NO menciones ciudades ni datos de otros paises.` : ''}${enfoque ? `\n- El enfoque del caso es "${enfoque}". Los escenarios deben estar alineados con este enfoque.` : ''}

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

export async function buildOnePagerContent(empresa, pais, idioma, enfoque, researchData, infoExtra, targetMode = 'company') {
  const isIndustry = targetMode === 'industry';
  const isEnglish = idioma?.toLowerCase().includes('ingles') || idioma?.toLowerCase().includes('english');
  const lang = isEnglish ? 'English' : 'Spanish';
  const systemPrompt = isEnglish
    ? (isIndustry
      ? `You are an expert in B2B marketing and sales enablement for BucketsAI. You generate precise, concrete one-pager sales content for an INDUSTRY/SECTOR, not a specific company. Content must apply to any company in the sector. Use typical sector examples with fictional names if needed. Never use emojis or long dashes. ALL output must be in English.`
      : `You are an expert in B2B marketing and sales enablement for BucketsAI. You generate precise, concrete, company-specific one-pager sales content. Never use emojis or long dashes. Use direct, persuasive language. ALL output must be in English.`)
    : (isIndustry
      ? `Eres un experto en marketing B2B y sales enablement para BucketsAI. Generas contenido de one-pagers de venta para una INDUSTRIA o SECTOR, no para una empresa especifica. El contenido debe aplicar a cualquier empresa del sector. Usa ejemplos tipicos con nombres ficticios si necesitas. Nunca uses emojis, guiones largos ni tildes. Todo en lenguaje directo y persuasivo.`
      : `Eres un experto en marketing B2B y sales enablement para BucketsAI. Generas contenido de one-pagers de venta precisos, concretos y especificos para cada empresa y enfoque. Nunca uses emojis, guiones largos ni tildes. Todo en lenguaje directo y persuasivo.`);

  const paisLabel = pais ? ` (${pais})` : '';
  const paisConstraint = pais
    ? `\nCOUNTRY RESTRICTION: All content must be specific to ${pais}.`
    : '';
  const industryConstraint = isIndustry
    ? `\nINDUSTRY MODE: This one-pager is GENERIC for the "${empresa}" industry. Do NOT name any specific company as the protagonist. Use phrases like "a typical ${empresa} company", "teams in ${empresa}", etc. You may mention real companies as REFERENCES, but the content must apply to ANY company in the sector.`
    : '';

  const langInstruction = isEnglish
    ? `\n\nCRITICAL LANGUAGE REQUIREMENT: ALL text content in the JSON must be written in ENGLISH. Every single field value — titles, descriptions, bullets, quotes, labels — must be in English. Do NOT write any field in Spanish.`
    : '';

  const targetLabel = isIndustry ? `the ${empresa} industry` : empresa;
  const onepager = await callLLM(systemPrompt, `${isEnglish ? 'Generate' : 'Genera'} the content for a BucketsAI sales one-pager targeting ${isIndustry ? 'the ' + empresa + ' industry' : empresa}${paisLabel}.

BUCKETSAI KNOWLEDGE:
${knowledge}

${isIndustry ? 'INDUSTRY' : 'COMPANY'} DATA:
${JSON.stringify(researchData, null, 2)}

EXTRA INFO: ${infoExtra || 'none'}
LANGUAGE: ${lang}
FOCUS: ${enfoque}${paisConstraint}${langInstruction}${industryConstraint}

${isEnglish ? 'IMPORTANT' : 'IMPORTANTE'}: Adapt EVERYTHING to the focus "${enfoque}" and ${isIndustry ? 'the ' + empresa + ' industry' : 'company ' + empresa}. Content must be ${isIndustry ? 'sector-specific — use typical roles, processes, and situations common across the industry' : 'hyper-specific — use real product names, processes, roles, and situations'}.

${isEnglish ? 'Return ONLY this JSON without backticks' : 'Devuelve SOLO este JSON sin backticks'}:
{
  "hero_titulo": "Frase impactante de 6-10 palabras sobre el problema real en el area de ${enfoque}. Ejemplo: El problema real en equipos de ventas",
  "hero_descripcion": "2-3 oraciones que profundicen el problema especifico de ${empresa}. Usar <strong>negritas</strong> para enfatizar la frase clave. Mencionar que no tienen la informacion correcta en el momento exacto de la ejecucion.",
  "pain_points": [
    {"bold": "Frase corta en negrita", "desc": "complemento en 3-5 palabras"},
    {"bold": "Frase corta en negrita", "desc": "complemento en 3-5 palabras"},
    {"bold": "Frase corta en negrita", "desc": "complemento en 3-5 palabras"},
    {"bold": "Frase corta en negrita", "desc": "complemento en 3-5 palabras"}
  ],
  "pain_quote": "Frase de cierre sobre que pasa cuando la decision no es clara. 1 oracion contundente.",
  "value_titulo": "BucketsAi es la inteligencia de decision para equipos de [area del enfoque].",
  "value_descripcion": "2 oraciones sobre como BucketsAI convierte <strong>todo el conocimiento comercial de ${empresa}</strong> en una capa de decision en tiempo real, disponible para cada [rol] mientras [contexto de uso].",
  "knowledge_items": [
    "Tipo de conocimiento 1 relevante para ${empresa} (ej: Catalogos de productos)",
    "Tipo 2 (ej: Listas de precios)",
    "Tipo 3 (ej: Reglas de negocio y elegibilidad)",
    "Tipo 4 (ej: Condiciones de pago y suscripciones)",
    "Tipo 5 (ej: Excepciones y politicas comerciales)",
    "Tipo 6 (ej: Guiones de venta)"
  ],
  "flow_titulo": "El [rol] [accion] en lenguaje natural y BucketsAi:",
  "flow_steps": [
    {"titulo": "Cruza el perfil", "desc": "con tus reglas reales de negocio"},
    {"titulo": "Recomienda el", "desc": "producto correcto"},
    {"titulo": "Devuelve precios,", "desc": "condiciones y restricciones"},
    {"titulo": "Entrega una decision", "desc": "clara, consistente y respaldada"}
  ],
  "flow_tagline": "Frase de cierre corta e impactante (ej: No mas improvisacion. No mas dejame validar.)",
  "caso_titulo": "Ejemplo practico (${enfoque} reales)",
  "caso_pregunta": "Pregunta realista y detallada que haria un empleado de ${empresa} a BucketsAI. Incluir datos especificos: nombre del cliente, edad, ingresos, situacion, producto que busca, restriccion. 3-4 oraciones con contexto rico.",
  "caso_respuesta": "Respuesta completa de BucketsAI con recomendacion especifica: nombre del producto, duracion, cobertura, prima/precio exacto, exclusiones, siguiente paso. 4-6 oraciones con datos concretos.",
  "caso_resultados": [
    {"bold": "Beneficio clave:", "desc": "explicacion concreta en 5-10 palabras"},
    {"bold": "Beneficio clave:", "desc": "explicacion concreta"},
    {"bold": "Beneficio clave:", "desc": "explicacion concreta"},
    {"bold": "Beneficio clave:", "desc": "explicacion concreta"},
    {"bold": "Beneficio clave:", "desc": "explicacion concreta"}
  ],
  "caso_conclusion": "Frase de cierre del caso. Contundente, 1 oracion.",
  "dim_a_titulo": "Titulo de Dimension A: 5-7 palabras sobre el primer eje de valor (ej: Inteligencia comercial en tiempo real)",
  "dim_a_rol": "Rol que usa dimension A (ej: Vendedor en campo)",
  "dim_a_desc": "2 oraciones sobre como BucketsAI apoya a este rol en ${empresa}.",
  "dim_a_caso": {
    "setup": "Contexto de la situacion en 1 oracion",
    "pregunta": "Pregunta realista del ${empresa} con datos especificos. 2 oraciones.",
    "respuesta_titulo": "Titulo de la respuesta BucketsAI",
    "respuesta_bullets": ["Instruccion/dato 1 especifico", "Instruccion 2", "Instruccion 3", "Instruccion 4"]
  },
  "dim_b_titulo": "Titulo de Dimension B: 5-7 palabras sobre el segundo eje de valor (ej: Visibilidad operativa para gerencia)",
  "dim_b_rol": "Rol que usa dimension B (ej: Gerente de zona)",
  "dim_b_desc": "2 oraciones sobre como BucketsAI apoya a este rol en ${empresa}.",
  "dim_b_caso": {
    "setup": "Contexto de la situacion en 1 oracion",
    "pregunta": "Pregunta realista de este rol con datos especificos. 2 oraciones.",
    "respuesta_titulo": "Titulo de la respuesta BucketsAI",
    "respuesta_bullets": ["Dato/insight 1 especifico", "Dato 2", "Dato 3", "Accion recomendada"]
  },
  "diferenciador_subtitulo": "BucketsAi no es una IA generica. Es infraestructura [comercial/operativa/de decision].",
  "implementacion": [
    "<strong>Conectas tu conocimiento actual</strong> (sin reemplazar sistemas).",
    "<strong>Defines roles y accesos</strong> por equipo.",
    "Los [rol] <strong>empiezan a decidir</strong> en tiempo real desde el primer dia."
  ],
  "ideal_para": [
    "Caracteristica 1 del cliente ideal usando <strong>negritas</strong> en lo clave",
    "Caracteristica 2",
    "Caracteristica 3",
    "Caracteristica 4"
  ],
  "ideal_industrias": "Lista corta de industrias relevantes separadas por coma",
  "cta_badge": "Frase corta para badge naranja (ej: BucketsAi no entrena vendedores.)",
  "cta_text": "Frase final CTA de 1-2 oraciones sobre el valor que entrega."
}`);

  return onepager;
}

export async function buildDeckContent(empresa, pais, idioma, enfoque, researchData, infoExtra, useCaseContent, targetMode = 'company') {
  const isIndustry = targetMode === 'industry';
  const isEnglish = idioma?.toLowerCase().includes('ingles') || idioma?.toLowerCase().includes('english');
  const lang = isEnglish ? 'English' : 'Spanish';
  const systemPrompt = isEnglish
    ? (isIndustry
      ? `You are an expert in B2B sales enablement for BucketsAI. You create commercial deck content for an INDUSTRY/SECTOR, not a specific company. Content must apply to any company in the sector. Never use emojis. ALL output must be in English.`
      : `You are an expert in B2B sales enablement for BucketsAI. You create hyper-specific, personalized commercial deck content. Never use emojis. ALL output must be in English.`)
    : (isIndustry
      ? `Eres un experto en sales enablement B2B para BucketsAI. Creas contenido de decks comerciales para una INDUSTRIA o SECTOR, no para una empresa especifica. El contenido debe aplicar a cualquier empresa del sector. Nunca uses emojis ni tildes. Todo en lenguaje directo y persuasivo.`
      : `Eres un experto en sales enablement B2B para BucketsAI. Creas contenido de decks comerciales hiper-especificos y personalizados. Nunca uses emojis ni tildes. Todo en lenguaje directo y persuasivo.`);

  const paisLabel = pais ? ` (${pais})` : '';
  const paisConstraint = pais
    ? `\nRESTRICCION DE PAIS: Todo el contenido debe ser especifico para ${pais}. Usa nombres de ciudades, zonas y datos que correspondan UNICAMENTE a ${pais}.`
    : '';
  const industryConstraint = isIndustry
    ? `\nMODO INDUSTRIA: Este deck es GENERICO para toda la industria "${empresa}". NO nombres ninguna empresa real especifica como protagonista. Usa frases como "una empresa tipica del sector", "los equipos del sector". Puedes mencionar empresas reales como REFERENCIAS. La slide de DEMO debe usar un ejemplo ficticio representativo del sector, no una empresa real.`
    : '';
  const langInstruction = isEnglish
    ? `\n\nCRITICAL: ALL text must be in ENGLISH. Every field value must be in English.`
    : '';

  const useCaseContext = useCaseContent
    ? `\nDATOS DEL CASO DE USO YA GENERADO (usa esta informacion para mayor especificidad):\n${JSON.stringify(useCaseContent, null, 2)}`
    : '';

  const targetLabel = isIndustry ? `la industria ${empresa}` : empresa;
  const deck = await callLLM(systemPrompt, `Genera el contenido completo para un deck comercial de BucketsAI ${isIndustry ? 'para la industria' : 'personalizado para'} ${empresa}${paisLabel}.

CONOCIMIENTO DE BUCKETSAI:
${knowledge}

DATOS ${isIndustry ? 'DE LA INDUSTRIA' : 'DE LA EMPRESA'}:
${JSON.stringify(researchData, null, 2)}

INFO EXTRA: ${infoExtra || 'ninguna'}
IDIOMA: ${lang}
ENFOQUE: ${enfoque}${paisConstraint}${langInstruction}${useCaseContext}${industryConstraint}

CRITICO:
- Las slides de PROBLEMA, PROFUNDIDAD y SOLUCION deben hablar del problema de la INDUSTRIA/SECTOR${isIndustry ? ' ' + empresa : ', NO de ' + empresa + ' directamente'}. ${isIndustry ? 'Todo el deck habla del sector en general.' : 'No sabemos si ' + empresa + ' tiene ese problema. Hablamos del reto comun del sector.'}
- La slide de DEMO ${isIndustry ? 'debe usar un ejemplo ficticio representativo del sector (inventa un nombre de empresa tipica)' : 'es donde SI personalizamos para ' + empresa + ': mostramos un caso de uso concreto como si fuera para ellos'}.
- La slide de IMPACTO habla del sector en general${isIndustry ? '' : ', NO nombra a ' + empresa}.
- El objetivo de este deck es hacer DISCOVERY: descubrir los problemas del prospecto, no asumir que los tiene.
- Usa datos reales de la industria, roles tipicos del sector, y situaciones comunes del enfoque "${enfoque}".

Devuelve SOLO este JSON sin backticks:
{
  "cover_tagline": "Frase poderosa de 12-18 palabras sobre como BucketsAI resuelve el problema central ${isIndustry ? 'del sector ' + empresa : 'del sector de ' + empresa} en ${enfoque}",
  "sector_label": "${isIndustry ? empresa : 'Nombre corto del sector/industria al que pertenece ' + empresa + ' (ej: seguros, retail, banca, logistica)'}",

  "problem_headline": "Frase impactante de 10-15 palabras sobre el problema real del SECTOR/INDUSTRIA. NO menciones a ${empresa}.",
  "problem_has_items": [
    "Recurso 1 que tienen los equipos del sector (ej: Catalogos de 500+ productos)",
    "Recurso 2 tipico del sector",
    "Recurso 3 tipico del sector",
    "Recurso 4 tipico del sector"
  ],
  "problem_but_items": [
    "Problema real 1 del sector cuando ejecutan (ej: La informacion esta en 4 sistemas distintos)",
    "Problema 2 comun del sector",
    "Problema 3 comun del sector",
    "Problema 4 comun del sector"
  ],
  "problem_closing": "Frase contundente de cierre sobre el sector: cuando [problema del sector], [consecuencia real]. 1 oracion. NO nombres a ${empresa}.",

  "depth_headline": "Frase que explica por que entrenar mejor/mas documentacion NO resuelve esto en el sector. NO nombres a ${empresa}.",
  "depth_reasons": [
    "Razon 1 del sector de por que el entrenamiento no escala (ej: Los vendedores deben aprender 50 reglas nuevas cada trimestre)",
    "Razon 2 del sector",
    "Razon 3 del sector",
    "Razon 4 del sector",
    "Razon 5 del sector"
  ],

  "solution_headline": "BucketsAi es [definicion adaptada al enfoque] para equipos de [sector]",
  "solution_description": "2-3 oraciones sobre como BucketsAI convierte el conocimiento del sector en decisiones en tiempo real. Habla del sector, NO de ${empresa}.",
  "solution_capabilities": [
    "Capacidad 1 adaptada al sector (ej: Consultar reglas de elegibilidad por perfil de cliente)",
    "Capacidad 2 del sector",
    "Capacidad 3 del sector",
    "Capacidad 4 del sector",
    "Capacidad 5 del sector"
  ],

  "how_step1": "Que conecta una empresa del sector (ej: Conectas catalogos, listas de precios y reglas de negocio)",
  "how_step2": "Como se configuran roles en el sector (ej: Defines accesos por tipo de asesor y nivel de autorizacion)",
  "how_step3": "Que logran los equipos del sector (ej: Los asesores cierran con la recomendacion correcta en tiempo real)",
  "how_not_items": [
    "NO reemplaza [sistema tipico del sector]",
    "NO requiere [algo que preocupa a este sector]",
    "NO cambia [flujo existente tipico]"
  ],

  "demo_headline": "Asi se tomaria una decision con BucketsAi en ${isIndustry ? 'una empresa del sector ' + empresa : empresa}",
  "demo_description": "3 oraciones sobre el flujo: el [rol ${isIndustry ? 'tipico del sector' : 'de ' + empresa}] describe la situacion, BucketsAi cruza con reglas, entrega decision clara.${isIndustry ? ' Usa un ejemplo ficticio representativo.' : ' AQUI SI personaliza para ' + empresa + '.'}",
  "demo_user_message": "Pregunta realista y detallada de un ${enfoque} ${isIndustry ? 'del sector ' + empresa + '. Usa un nombre de empresa ficticio representativo' : 'de ' + empresa}. Incluir nombre de cliente, datos especificos, situacion concreta, producto. 3-4 oraciones.",
  "demo_ai_response": "Respuesta de BucketsAI con recomendacion exacta: producto, precio, condiciones, siguiente paso. 4-5 oraciones con datos concretos ${isIndustry ? 'del sector' : 'de ' + empresa}.",

  "dim_a_titulo": "Dimension A: titulo 5-7 palabras (ej: Inteligencia comercial en tiempo real)",
  "dim_a_rol": "Rol de dimension A tipico del sector",
  "dim_a_desc": "2 oraciones sobre como BucketsAI apoya este rol en el sector. Puede mencionar a ${empresa} como ejemplo.",
  "dim_b_titulo": "Dimension B: titulo 5-7 palabras (ej: Visibilidad operativa para gerencia)",
  "dim_b_rol": "Rol de dimension B tipico del sector",
  "dim_b_desc": "2 oraciones sobre como BucketsAI apoya este rol en el sector. Puede mencionar a ${empresa} como ejemplo.",

  "before_items": [
    "Situacion antes 1 del sector (ej: El vendedor consulta 3 documentos distintos)",
    "Situacion antes 2",
    "Situacion antes 3"
  ],
  "after_items": [
    "Situacion despues 1 del sector (ej: BucketsAi entrega la recomendacion en 3 segundos)",
    "Situacion despues 2",
    "Situacion despues 3"
  ],

  "impact_title": "Que cambia cuando la decision es clara",
  "impact_subtitle": "Impacto directo en [area 1], [area 2] y [area 3] del sector",
  "impact_col1_title": "Velocidad",
  "impact_col1_metric": "Dato numerico antes vs despues (ej: 15min -> 3 seg)",
  "impact_col1_before": "valor numerico del antes (ej: 15)",
  "impact_col1_after": "valor numerico del despues (ej: 0.05)",
  "impact_col1_unit": "unidad (ej: minutos)",
  "impact_col2_title": "Mas [resultado positivo]",
  "impact_col2_metric": "Dato numerico (ej: +25% en tasa de conversion)",
  "impact_col2_before": "valor numerico del antes (ej: 60)",
  "impact_col2_after": "valor numerico del despues (ej: 85)",
  "impact_col2_unit": "unidad (ej: %)",
  "impact_col3_title": "Menos [problema]",
  "impact_col3_metric": "Dato numerico (ej: -40% cancelaciones)",
  "impact_col3_before": "valor numerico del antes (ej: 35)",
  "impact_col3_after": "valor numerico del despues (ej: 12)",
  "impact_col3_unit": "unidad (ej: %)",
  "impact_closing": "Frase de cierre sobre el impacto en el sector. 1 oracion contundente. NO nombres a ${empresa}.",

  "comparison_headline": "ChatGPT responde preguntas. BucketsAi gobierna decisiones de ${enfoque}.",

  "cta_question": "Pregunta de cierre que haga reflexionar al prospecto sobre su problema en el sector. 1-2 oraciones.",
  "cta_description": "Frase sobre lo que BucketsAi entrega: la decision correcta ([detalles]) cuando [momento clave]. 1-2 oraciones."
}`);

  return deck;
}
