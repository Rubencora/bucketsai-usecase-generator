import 'dotenv/config';
import { researchCompany } from './src/researcher.js';
import { buildContent } from './src/content_builder.js';
import { generateDocx } from './src/doc_generator.js';

// Test run with hardcoded inputs — use npm start for interactive mode
const inputs = {
  empresa: 'Grupo Exito',
  pais: 'Colombia',
  idioma: 'Espanol',
  enfoque: 'Auto (el agente decide segun el perfil)',
  infoExtra: '',
};

console.log(`\n[1/3] Investigando ${inputs.empresa}...`);
const researchData = await researchCompany(inputs.empresa, inputs.pais, inputs.infoExtra);
console.log('   Datos obtenidos:', JSON.stringify(researchData, null, 2).slice(0, 300));

console.log(`[2/3] Construyendo contenido...`);
const content = await buildContent(inputs.empresa, inputs.pais, inputs.idioma, inputs.enfoque, researchData, inputs.infoExtra);

console.log(`[3/3] Generando documento...`);
const outputPath = await generateDocx(content);

console.log(`\n\u2705 Caso de uso generado`);
console.log(`   Empresa:     ${inputs.empresa}`);
console.log(`   Sector:      ${researchData.sector}`);
console.log(`   Dimension A: ${content.dim_a_titulo}`);
console.log(`   Dimension B: ${content.dim_b_titulo}`);
console.log(`   Archivo:     ${outputPath}\n`);
