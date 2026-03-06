import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI();

async function crawlWithFirecrawl(url) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey || !url) return null;
  try {
    console.log('   Crawleando sitio web con Firecrawl...');
    const res = await axios.post(
      'https://api.firecrawl.dev/v1/scrape',
      {
        url,
        formats: ['markdown'],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    const markdown = res.data?.data?.markdown || '';
    // Truncate to avoid token limits
    return markdown.slice(0, 8000) || null;
  } catch (err) {
    console.log(`   Advertencia: no se pudo crawlear ${url} (${err.message})`);
    return null;
  }
}

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

export async function researchCompany(empresa, pais, infoExtra, url) {
  // Run crawl and search in parallel
  const paisContext = pais ? ` ${pais}` : '';
  const queries = [
    `${empresa} empresa operaciones empleados${paisContext}`,
    `${empresa} fuerza de ventas canales distribucion`,
    `${empresa} productos portafolio catalogo`,
    `${empresa} ingresos tamano colaboradores`,
    `${empresa} retos desafios estrategia operativa`,
  ];

  console.log('   Buscando informacion...');
  const [crawlData, ...searchResults] = await Promise.all([
    crawlWithFirecrawl(url),
    ...queries.map((q) => search(q)),
  ]);

  const allResults = searchResults.join('\n\n---\n\n');

  if (!allResults.trim() && !crawlData) {
    console.log('   Advertencia: no se encontraron resultados de busqueda ni datos del sitio web. Se usara contexto del usuario.');
  }

  const crawlSection = crawlData
    ? `\n\nContenido del sitio web de la empresa (${url}):\n${crawlData}`
    : '';

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
${allResults}${crawlSection}

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
