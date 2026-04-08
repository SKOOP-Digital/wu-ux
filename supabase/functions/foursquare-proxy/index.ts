const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let query: string | null = null
  let ll: string | null = null
  let radius: string | null = null
  let limit = '50'

  // Support both GET query params and POST body
  if (req.method === 'POST') {
    const body = await req.json()
    query = body.query
    ll = body.ll
    radius = body.radius
    limit = body.limit || '50'
  } else {
    const url = new URL(req.url)
    query = url.searchParams.get('query')
    ll = url.searchParams.get('ll')
    radius = url.searchParams.get('radius')
    limit = url.searchParams.get('limit') || '50'
  }

  if (!query || !ll || !radius) {
    return new Response(JSON.stringify({ error: 'Missing query, ll, or radius' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const apiKey = Deno.env.get('FOURSQUARE_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'FOURSQUARE_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const params = new URLSearchParams({ query, ll, radius, limit })
  const fsqUrl = `https://api.foursquare.com/v3/places/search?${params.toString()}`

  try {
    const res = await fetch(fsqUrl, {
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
    })

    const body = await res.text()
    return new Response(body, {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})