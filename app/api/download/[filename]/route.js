import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request, { params }) {
  const { filename } = await params;
  const filePath = join(process.cwd(), 'output', filename);

  if (!existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }

  const buffer = readFileSync(filePath);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
