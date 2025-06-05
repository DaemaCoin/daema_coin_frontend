import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://daemacoin-server.xquare.app';

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function GET(
  req: NextRequest,
  context: RouteParams
) {
  try {
    const { storeId } = await context.params;
    
    const response = await fetch(`${API_BASE_URL}/store/${storeId}/products`, {
      method: 'GET',
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Store products error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 