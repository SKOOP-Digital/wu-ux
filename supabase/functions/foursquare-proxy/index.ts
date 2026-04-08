const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let query: string | null = null
    let ll: string | null = null
    let radius: string | null = null
    let limit = '50'

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

    const [lat, lng] = ll.split(',').map(Number)
    const radiusKm = Math.min(Number(radius), 100000) / 1000
    const limitNum = Math.min(Number(limit), 50)

    // Build a viewbox around the center point (radius in degrees, ~111km per degree)
    const degOffset = radiusKm / 111
    const viewbox = `${lng - degOffset},${lat - degOffset},${lng + degOffset},${lat + degOffset}`

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: String(limitNum),
      viewbox,
      bounded: '1',
      addressdetails: '1',
    })

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?${params.toString()}`

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'LovableApp/1.0 (POI search)',
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Nominatim error:', res.status, errText)
      return new Response(JSON.stringify({ error: `Nominatim API error: ${res.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json()

    // Transform Nominatim results to our common POI format
    const results = (data || []).map((el: any) => ({
      fsq_id: `osm-${el.osm_type}-${el.osm_id}`,
      name: el.display_name?.split(',')[0] || el.name || 'Unknown',
      location: {
        address: el.display_name || undefined,
        lat: Number(el.lat),
        lng: Number(el.lon),
      },
      categories: el.type ? [{ name: el.type }] : [],
    }))

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('POI proxy error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
