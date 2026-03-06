import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI();

async function searchTavily(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await axios.post('https://api.tavily.com/search', {
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      max_results: 8,
    });
    return res.data.results?.map((r) => `${r.title}: ${r.content}`).join('\n') || '';
  } catch {
    return null;
  }
}

async function searchDuckDuckGo(query) {
  try {
    const res = await axios.get('https://api.duckduckgo.com/', {
      params: { q: query, format: 'json', no_html: 1 },
    });
    const data = res.data;
    const parts = [];
    if (data.Abstract) parts.push(data.Abstract);
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text) parts.push(topic.Text);
      }
    }
    return parts.join('\n') || '';
  } catch {
    return '';
  }
}

async function search(query) {
  const tavilyResult = await searchTavily(query);
  if (tavilyResult !== null) return tavilyResult;
  return searchDuckDuckGo(query);
}

export async function researchCompany(empresa, pais, infoExtra) {
  const queries = [
    `${empresa} empresa operaciones empleados ${pais}`,
    `${empresa} fuerza de ventas canales distribucion`,
    `${empresa} productos portafolio catalogo`,
    `${empresa} ingresos tamano colaboradores`,
    `${empresa} retos desafios estrategia operativa`,
  ];

  console.log('   Buscando informacion...');
  const results = await Promise.all(queries.map((q) => search(q)));
  const allResults = results.join('\n\n---\n\n');

  if (!allResults.trim()) {
    console.log('   Advertencia: no se encontraron resultados de busqueda. Se usara contexto del usuario.');
  }

  const prompt = `Analiza estos resultados de busqueda sobre la empresa "${empresa}" y devuelve SOLO un JSON con:
{
  "descripcion": "que hace la empresa (2 oraciones)",
  "sector": "industria principal",
  "tamano": "numero aproximado de empleados o colaboradores",
  "presencia": "cobertura geografica",
  "canales": "como venden o distribuyen",
  "productos": ["producto1", "producto2", "producto3"],
  "fuerza_comercial": "estructura del equipo de ventas/operaciones",
  "puntos_venta": "numero de tiendas o puntos de atencion",
  "kpis_publicos": ["kpi1", "kpi2", "kpi3", "kpi4"],
  "retos": "desafios operativos conocidos",
  "sector_tipo": "retail|banca|seguros|telco|logistica|bpo|otro"
}
Si no encuentras un dato, usa null. SOLO el JSON, sin backticks ni texto adicional.

Resultados de busqueda:
${allResults}

Informacion adicional del usuario: ${infoExtra || 'ninguna'}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.choices[0].message.content.trim();

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No se pudo parsear la respuesta del researcher: ' + text.slice(0, 200));
  }
}
