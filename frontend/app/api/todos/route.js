export async function POST(req) {
  try {
    const body = await req.json();
    const { filename } = body || {};
    // Stub to-dos
    const todos = [
      { id: 1, text: 'Read introduction', done: false },
      { id: 2, text: 'Extract key deadlines', done: false },
      { id: 3, text: 'Prepare study plan', done: false }
    ];
    return Response.json({ ok: true, filename, todos });
  } catch (e) {
    return Response.json({ error: 'To-Do extraction failed' }, { status: 500 });
  }
}


