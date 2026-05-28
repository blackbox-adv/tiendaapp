import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const stores = await db.store.findMany({
      where: { isDemo: true },
      include: {
        products: true,
        categories: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching demo stores:', error);
    return NextResponse.json({ error: 'Failed to fetch demo stores' }, { status: 500 });
  }
}
