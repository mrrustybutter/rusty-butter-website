import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth error
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', details: error },
      { status: 400 }
    )
  }

  // Handle successful OAuth callback
  if (code && state) {
    try {
      // Here you would exchange the code for an access token
      // For now, we'll just log the successful callback
      console.log('OAuth callback received:', { code, state })
      
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        code,
        state
      })
    } catch (error) {
      console.error('Error processing OAuth callback:', error)
      return NextResponse.json(
        { error: 'Failed to process authentication' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Missing required parameters' },
    { status: 400 }
  )
}

export async function POST(request: NextRequest) {
  // Handle POST requests if needed for OAuth flow
  return NextResponse.json({ message: 'POST method not implemented yet' })
}