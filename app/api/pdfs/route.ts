import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/lib';
import fs from 'fs/promises';
import path from 'path';
import { ResultSetHeader } from 'mysql2/promise';

// GET → List all PDFs
export async function GET() {
try {
    const [rows] = await pool.execute(
    'SELECT id, filename, filepath, size, uploaded_at, status FROM pdfs ORDER BY uploaded_at DESC'
    );
    return NextResponse.json(rows);
} catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch PDFs' }, { status: 500 });
}
}

// POST → Upload PDF
export async function POST(request: NextRequest) {
try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, buffer);

    // Save to database
    const dbPath = `/uploads/${uniqueName}`;   // this is the public URL
    const [result] = await pool.execute(
    'INSERT INTO pdfs (filename, filepath, size) VALUES (?, ?, ?)',
    [file.name, dbPath, buffer.length]
    );

    const insertId = (result as ResultSetHeader).insertId;

    return NextResponse.json({
    id: insertId,
    filename: file.name,
    filepath: dbPath,
    message: 'PDF uploaded successfully'
    });
} catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
}
}