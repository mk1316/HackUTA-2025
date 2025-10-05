export async function POST(req) {
  try {
    const body = await req.json();
    const { filename, size } = body || {};
    // Stub extraction
    const deadlines = [
      { title: 'Assignment 1', due: '2025-10-15T17:00:00Z' },
      { title: 'Project Proposal', due: '2025-10-22T23:59:00Z' }
    ];
    return Response.json({ ok: true, source: { filename, size }, deadlines, hint: 'Integrate Google Calendar API here.' });
  } catch (e) {
    return Response.json({ error: 'Deadline extraction failed' }, { status: 500 });
  }
}


