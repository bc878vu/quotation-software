import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { task, text, context } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: 'Text is required.' }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI is not configured. Add OPENAI_API_KEY on the server.' }, { status: 503 });

    const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
    const instructions = `You are CVForge AI, a professional CV writing assistant. Improve only information supported by the user's input and context. Never invent employers, dates, degrees, skills, metrics, certifications or achievements. Keep claims truthful. Return concise, professional CV-ready text. Task: ${task || 'improve CV content'}.`;
    const input = `User text:\n${text}\n\nCV context:\n${context || 'None'}`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, instructions, input }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `AI provider error: ${detail}` }, { status: response.status });
    }

    const data = await response.json();
    const output = (data.output || [])
      .flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content || [])
      .filter((item: { type?: string; text?: string }) => item.type === 'output_text')
      .map((item: { text?: string }) => item.text || '')
      .join('\n')
      .trim();

    return NextResponse.json({ output: output || data.output_text || '' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected AI error.' }, { status: 500 });
  }
}
