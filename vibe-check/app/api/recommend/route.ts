import { NextResponse } from 'next/server';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const RECOMMENDATIONS_ENDPOINT = `https://api.spotify.com/v1/recommendations`;

// Helper function to get Access Token
const getAccessToken = async () => {
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  return response.json();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { seed_genres, target_valence, target_energy } = body;

    // 1. Get Token
    const tokenData = await getAccessToken();
    const access_token = tokenData.access_token;

    if (!access_token) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Spotify' },
        { status: 500 }
      );
    }

    // 2. Fetch Recommendations
    const queryParams = new URLSearchParams({
      limit: '12',
      market: 'US',
      seed_genres: seed_genres,
      target_valence: target_valence.toString(),
      target_energy: target_energy.toString(),
    });

    const trackResponse = await fetch(`${RECOMMENDATIONS_ENDPOINT}?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const tracksData = await trackResponse.json();

    if (tracksData.error) {
      console.error('Spotify API Error:', tracksData.error);
      return NextResponse.json(
        { error: tracksData.error.message },
        { status: 500 }
      );
    }

    // 3. Return Data
    return NextResponse.json(tracksData.tracks);

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}