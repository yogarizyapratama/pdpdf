import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tool = searchParams.get('tool') || 'PDF Tools'
    const category = searchParams.get('category') || 'Free Online'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#667EEA',
            backgroundImage: 'linear-gradient(45deg, #667EEA 0%, #764BA2 100%)',
          }}
        >
          {/* Main container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              margin: '60px',
            }}
          >
            {/* Logo area */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  fontSize: '60px',
                  marginRight: '20px',
                }}
              >
                📄
              </div>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #667EEA 0%, #764BA2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                PDPDF
              </div>
            </div>
            
            {/* Tool name */}
            <div
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                color: '#1f2937',
                textAlign: 'center',
                marginBottom: '15px',
                maxWidth: '800px',
                lineHeight: 1.2,
              }}
            >
              {tool}
            </div>
            
            {/* Category and features */}
            <div
              style={{
                fontSize: '28px',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              {category} • Free • Secure • No Registration
            </div>
            
            {/* Feature badges */}
            <div
              style={{
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                ✓ Fast Processing
              </div>
              <div
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                ✓ Client-Side
              </div>
              <div
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                ✓ No Limits
              </div>
            </div>
          </div>
          
          {/* Bottom URL */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              fontSize: '24px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 'bold',
            }}
          >
            pdpdf.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
