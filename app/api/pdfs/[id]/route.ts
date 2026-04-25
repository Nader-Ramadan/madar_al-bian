import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/lib';

export async function PATCH(
request: NextRequest,
{ params }: { params: Promise<{ id: string }> }
) {
const { id: idString } = await params;
const id = parseInt(idString);
try {
    const { status } = await request.json();

    await pool.execute(
    'UPDATE pdfs SET status = ? WHERE id = ?',
    [status, id]
    );

    return NextResponse.json({ message: 'Status updated' });
} catch (error) {
    console.error('Failed to update PDF status:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
}
}