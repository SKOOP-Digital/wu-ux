import { corsHeaders } from '@supabase/supabase-js/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const query = url.searchParams.get('query')
  const ll = url.searchParams.get('ll')
  const radius = url.searchParams.get('radius')
  const limit = url.searchParams.get('limit') || '50'

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