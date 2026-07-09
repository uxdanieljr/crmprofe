import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'database.db')
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'Database file not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(dbPath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="database.db"',
        'Content-Type': 'application/x-sqlite3',
      },
    })
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 })
  }
}
