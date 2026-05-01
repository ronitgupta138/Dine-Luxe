import { NextResponse } from 'next/server';

export async function GET() {
  const sample = {
    floors: [
      {
        id: 'floor-1',
        name: 'Main Floor',
        tables: [
          { id: 't1', label: 'A1', capacity: 4, shape: 'round', x: 40, y: 60, status: 'free' },
          { id: 't2', label: 'A2', capacity: 2, shape: 'rectangle', x: 160, y: 60, status: 'occupied' },
          { id: 't3', label: 'B1', capacity: 6, shape: 'booth', x: 40, y: 180, status: 'free' },
        ],
      },
    ],
  };

  return NextResponse.json({ success: true, data: sample });
}
