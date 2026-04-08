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
    const radiusNum = Math.min(Number(radius), 100000)
    const limitNum = Math.min(Number(limit), 50)
    const escapedQuery = query.replace(/"/g, '\\"')

    // Use Overpass API to search for POIs by name
    const overpassQuery = `
      [out:json][timeout:25];
      (
        nwr["name"~"${escapedQuery}",i](around:${radiusNum},${lat},${lng});
      );
      out center ${limitNum};
    `

    const overpassUrl = 'https://overpass-api.de/api/interpreter'
    const res = await fetch(overpassUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Overpass error:', res.status, errText)
      return new Response(JSON.stringify({ error: `Overpass API error: ${res.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json()

    // Transform Overpass elements to a common POI format
    const results = (data.elements || []).map((el: any) => {
      const elLat = el.lat ?? el.center?.lat ?? 0
      const elLng = el.lon ?? el.center?.lon ?? 0
      return {
        fsq_id: `osm-${el.type}-${el.id}`,
        name: el.tags?.name || 'Unknown',
        location: {
          address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city'], el.tags?.['addr:state']].filter(Boolean).join(', ') || undefined,
          lat: elLat,
          lng: elLng,
        },
        categories: el.tags?.amenity ? [{ name: el.tags.amenity }]
          : el.tags?.shop ? [{ name: el.tags.shop }]
          : el.tags?.leisure ? [{ name: el.tags.leisure }]
          : [],
      }
    })

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
