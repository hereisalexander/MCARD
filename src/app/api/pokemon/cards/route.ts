import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '20';
    const q = searchParams.get('q') || '';

    let targetUrl = `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=${pageSize}`;
    if (q) {
      targetUrl += `&q=${encodeURIComponent(q)}`;
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache results for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Pokémon TCG API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Proxy API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards from Pokémon TCG API' },
      { status: 500 }
    );
  }
}
