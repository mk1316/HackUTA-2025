export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return Response.json({ error: 'Missing file' }, { status: 400 });
    const name = file.name || 'upload.pdf';
    const size = file.size || 0;
    const type = file.type || '';
    if (!type.includes('pdf') && !name.toLowerCase().endsWith('.pdf')) {
      return Response.json({ error: 'Only PDF accepted' }, { status: 415 });
    }
    return Response.json({ ok: true, name, size, message: 'Uploaded (stub) stored in memory' });
  } catch (e) {
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}


