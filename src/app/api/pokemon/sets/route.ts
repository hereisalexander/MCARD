import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const targetUrl = 'https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=36';

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 600 }, // Cache sets for 10 minutes
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
    console.error('Error in Proxy Sets API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sets from Pokémon TCG API' },
      { status: 500 }
    );
  }
}
