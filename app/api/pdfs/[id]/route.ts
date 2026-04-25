import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/lib';

export async function PATCH(
request: NextRequest,
{ params }: { params: { id: string } }
) {
const id = parseInt(params.id);
try {
    const { status } = await request.json();

    await pool.execute(
    'UPDATE pdfs SET status = ? WHERE id = ?',
    [status, id]
    );

    return NextResponse.json({ message: 'Status updated' });
} catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
}
}