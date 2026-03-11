import 'dotenv/config';
import { getSession } from '../../../src/auth.js';
import { researchCompany, researchIndustry } from '../../../src/researcher.js';
import { buildContent, buildOnePagerContent, buildDeckContent } from '../../../src/content_builder.js';
import { generateDocx } from '../../../src/doc_generator.js';
import { generatePdf } from '../../../src/pdf_generator.js';
import { generateOnePager } from '../../../src/onepager_generator.js';
import { generateOnePagerDocx } from '../../../src/onepager_doc_generator.js';
import { generateDeck } from '../../../src/deck_generator.js';
import { generateDeckTemplate } from '../../../src/deck_template_generator.js';
import { generateDeckPresenton } from '../../../src/presenton_deck_generator.js';
import { generateDeckGamma } from '../../../src/gamma_deck_generator.js';
import pool from '../../../src/db.js';

export const maxDuration = 180;

export async function POST(request) {
  const session = await getSession();
  const { empresa, url, pais, idioma, enfoque, infoExtra, docType = 'usecase', deckEngine = 'auto', targetMode = 'company' } = await request.json();

  const wantUseCase = docType === 'usecase' || docType === 'both';
  const wantOnePager = docType === 'onepager' || docType === 'both';
  const wantDeck = docType === 'deck' || docType === 'both';

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        // Step 1: Research
        const isIndustry = targetMode === 'industry';
        send({ type: 'step', message: isIndustry ? `Investigando industria: ${empresa}...` : `Investigando ${empresa}...` });
        const researchData = isIndustry
          ? await researchIndustry(empresa, pais, infoExtra)
          : await researchCompany(empresa, pais, infoExtra, url);
        send({ type: 'step', message: isIndustry ? `Datos de la industria ${empresa} obtenidos` : `Datos de ${empresa} obtenidos` });

        let content = null;
        let docxFilename = null;
        let pdfFilename = null;
        let onepagerFilename = null;
        let onepagerDocxFilename = null;
        let deckFilename = null;

        // Use Case documents (PDF + Word)
        if (wantUseCase) {
          send({ type: 'step', message: 'Generando contenido con IA...' });
          content = await buildContent(empresa, pais, idioma, enfoque, researchData, infoExtra, targetMode);
          send({ type: 'step', message: 'Contenido completo generado' });

          send({ type: 'step', message: 'Construyendo documento Word...' });
          const docxPath = await generateDocx(content);
          docxFilename = docxPath.split('/').pop();
          send({ type: 'step', message: 'Documento .docx generado' });

          send({ type: 'step', message: 'Generando PDF...' });
          const pdfPath = await generatePdf(content);
          pdfFilename = pdfPath.split('/').pop();
          send({ type: 'step', message: 'Documento .pdf generado' });
        }

        // One-pager
        if (wantOnePager) {
          send({ type: 'step', message: 'Generando contenido del One-Pager...' });
          const onepagerContent = await buildOnePagerContent(empresa, pais, idioma, enfoque, researchData, infoExtra, targetMode);
          send({ type: 'step', message: 'Construyendo One-Pager PDF...' });
          const onepagerPath = await generateOnePager(onepagerContent, empresa, content, idioma);
          onepagerFilename = onepagerPath.split('/').pop();
          send({ type: 'step', message: 'One-Pager PDF generado' });

          send({ type: 'step', message: 'Generando One-Pager Word...' });
          const onepagerDocxPath = await generateOnePagerDocx(onepagerContent, empresa);
          onepagerDocxFilename = onepagerDocxPath.split('/').pop();
          send({ type: 'step', message: 'One-Pager Word generado' });
        }

        // Commercial Deck
        if (wantDeck) {
          send({ type: 'step', message: 'Generando contenido del Deck Comercial...' });
          const deckContent = await buildDeckContent(empresa, pais, idioma, enfoque, researchData, infoExtra, content, targetMode);

          // Check if user can use Gamma (admin always can, others need gamma_enabled)
          let canUseGamma = false;
          if (process.env.GAMMA_API_KEY && session?.userId) {
            if (session.role === 'admin') {
              canUseGamma = true;
            } else {
              try {
                const { rows } = await pool.query('SELECT gamma_enabled FROM users WHERE id = $1', [session.userId]);
                canUseGamma = rows[0]?.gamma_enabled === true;
              } catch { canUseGamma = false; }
            }
          }

          // Resolve engine: default to gamma for authorized users, presenton for others
          const useGamma = canUseGamma && (deckEngine === 'auto' || deckEngine === 'gamma');

          if (useGamma) {
            // Gamma path (default for authorized users)
            try {
              send({ type: 'step', message: 'Construyendo Deck via Gamma...' });
              const result = await generateDeckGamma(deckContent, empresa);
              deckFilename = result.path.split('/').pop();
              send({ type: 'step', message: 'Deck Comercial generado con Gamma' });
            } catch (gammaErr) {
              console.error('Gamma deck failed, falling back to Presenton:', gammaErr.message);
              send({ type: 'step', message: 'Gamma fallo, usando Presenton...' });
              try {
                const result = await generateDeckPresenton(deckContent, empresa);
                deckFilename = result.path.split('/').pop();
                send({ type: 'step', message: 'Deck Comercial generado' });
              } catch (presErr) {
                console.error('Presenton fallback also failed:', presErr.message);
                const deckPath = await generateDeckTemplate(deckContent, empresa);
                deckFilename = deckPath.split('/').pop();
                send({ type: 'step', message: 'Deck Comercial generado' });
              }
            }
          } else if (process.env.PRESENTON_API_KEY) {
            // Presenton path (default for non-authorized users)
            try {
              send({ type: 'step', message: 'Construyendo Deck via Presenton AI...' });
              const result = await generateDeckPresenton(deckContent, empresa);
              deckFilename = result.path.split('/').pop();
              send({ type: 'step', message: 'Deck Comercial generado' });
            } catch (presErr) {
              console.error('Presenton deck failed, falling back to template:', presErr.message);
              send({ type: 'step', message: 'Construyendo Deck desde template...' });
              const deckPath = await generateDeckTemplate(deckContent, empresa);
              deckFilename = deckPath.split('/').pop();
              send({ type: 'step', message: 'Deck Comercial generado' });
            }
          } else {
            // No API keys: Template > PptxGenJS
            try {
              send({ type: 'step', message: 'Construyendo Deck desde template...' });
              const deckPath = await generateDeckTemplate(deckContent, empresa);
              deckFilename = deckPath.split('/').pop();
              send({ type: 'step', message: 'Deck Comercial generado' });
            } catch (tplErr) {
              console.error('Template deck failed, falling back to PptxGenJS:', tplErr.message);
              send({ type: 'step', message: 'Construyendo Deck PPTX...' });
              const deckPath = await generateDeck(deckContent, empresa);
              deckFilename = deckPath.split('/').pop();
              send({ type: 'step', message: 'Deck Comercial generado' });
            }
          }
        }

        // Save to database
        try {
          const userId = session?.userId || null;
          await pool.query(
            `INSERT INTO use_cases (user_id, empresa, pais, idioma, enfoque, info_extra, sector, dim_a, dim_b, pdf_filename, docx_filename, onepager_filename, onepager_docx_filename, deck_filename, target_mode)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [userId, empresa, pais, idioma, enfoque, infoExtra, researchData.sector, content?.dim_a_titulo || null, content?.dim_b_titulo || null, pdfFilename, docxFilename, onepagerFilename, onepagerDocxFilename, deckFilename, targetMode]
          );
        } catch (dbErr) {
          console.error('Error saving to DB:', dbErr.message);
        }

        // Done
        send({
          type: 'done',
          empresa,
          sector: researchData.sector,
          dim_a: content?.dim_a_titulo || null,
          dim_b: content?.dim_b_titulo || null,
          docxFilename,
          pdfFilename,
          onepagerFilename,
          onepagerDocxFilename,
          deckFilename,
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
