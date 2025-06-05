import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://daemacoin-server.xquare.app';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function POST(
  req: NextRequest,
  context: RouteParams
) {
  try {
    const { orderId } = await context.params;
    const authHeader = req.headers.get('authorization');
    
    const response = await fetch(`${API_BASE_URL}/store/orders/${orderId}/complete`, {
      method: 'POST',
      headers: {
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Order complete error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 