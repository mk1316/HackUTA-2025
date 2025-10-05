export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'No valid authorization token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // For demo purposes, we'll just validate that a token exists
    // In production, you would verify the JWT token with Auth0
    if (!token || token.length < 10) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Example: Call your backend API with the access token
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/api/protected`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        return Response.json({
          message: 'Successfully authenticated with Auth0',
          tokenInfo: {
            hasAccessToken: !!token,
            tokenLength: token.length,
          },
          backendData,
          timestamp: new Date().toISOString()
        });
      } else {
        return Response.json({
          message: 'Auth0 authentication successful, but backend API not available',
          tokenInfo: {
            hasAccessToken: !!token,
            tokenLength: token.length,
          },
          backendError: 'Backend API not responding',
          timestamp: new Date().toISOString()
        });
      }
    } catch (backendError) {
      return Response.json({
        message: 'Auth0 authentication successful, but backend API not available',
        tokenInfo: {
          hasAccessToken: !!token,
          tokenLength: token.length,
        },
        backendError: 'Backend API connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Protected API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
