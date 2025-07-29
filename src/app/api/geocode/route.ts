import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BusinessApp/1.0',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      results: data,
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to geocode address'
      },
      { status: 500 }
    );
  }
}