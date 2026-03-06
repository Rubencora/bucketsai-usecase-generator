import 'dotenv/config';
import { researchCompany } from '../../../src/researcher.js';
import { buildContent } from '../../../src/content_builder.js';
import { generateDocx } from '../../../src/doc_generator.js';

export const maxDuration = 120;

export async function POST(request) {
  const { empresa, pais, idioma, enfoque, infoExtra } = await request.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        // Step 1: Research
        send({ type: 'step', message: `Investigando ${empresa}...` });
        const researchData = await researchCompany(empresa, pais, infoExtra);
        send({ type: 'step', message: `Datos de ${empresa} obtenidos` });

        // Step 2: Content
        send({ type: 'step', message: 'Generando secciones base...' });
        const content = await buildContent(empresa, pais, idioma, enfoque, researchData, infoExtra);
        send({ type: 'step', message: 'Contenido completo generado' });

        // Step 3: Document
        send({ type: 'step', message: 'Construyendo documento Word...' });
        const outputPath = await generateDocx(content);
        const filename = outputPath.split('/').pop();
        send({ type: 'step', message: 'Documento .docx generado' });

        // Done
        send({
          type: 'done',
          empresa,
          sector: researchData.sector,
          dim_a: content.dim_a_titulo,
          dim_b: content.dim_b_titulo,
          filename,
        });
      } catch (err) {
        send({ type: 'error', message: err.message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
