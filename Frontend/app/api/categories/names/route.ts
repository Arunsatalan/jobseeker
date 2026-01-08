import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// GET /api/categories/names - Get category names only
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/categories/names`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch category names');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching category names:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch category names' },
      { status: 500 }
    );
  }
}