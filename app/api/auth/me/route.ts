import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserServer()
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}