import { games } from '../store';
import { NextResponse } from 'next/server';

// TODO: Fix type issues with Next.js App Router route handlers
// Current implementation uses URL parsing as a workaround for Next.js 14+ route handler type conflicts
// Should be updated to use proper params when type issues are resolved

// Simplified handlers with basic types to avoid Next.js type conflicts
export async function GET(
  request: Request
) {
  // Extract ID from URL since we can't use params
  const id = request.url.split('/').pop()!;
  const game = games.get(id);

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  return NextResponse.json(game);
}

export async function DELETE(
  request: Request
) {
  // Extract ID from URL since we can't use params
  const id = request.url.split('/').pop()!;
  const game = games.get(id);

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  games.delete(id);
  return NextResponse.json({ success: true });
}
