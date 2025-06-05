import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://daemacoin-server.xquare.app';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const response = await fetch(`${API_BASE_URL}/store/my-products`, {
      method: 'GET',
      headers: {
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('My products error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 