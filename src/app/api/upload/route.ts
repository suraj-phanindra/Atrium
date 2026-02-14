import { storePdfBuffer } from '@/lib/agents/architect';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.pdf')) {
      return Response.json({ error: 'Only PDF files are accepted' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = crypto.randomUUID();

    // Store buffer in memory for later extraction
    storePdfBuffer(fileId, buffer);

    return Response.json({
      file_id: fileId,
      name: file.name,
      size: file.size,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
