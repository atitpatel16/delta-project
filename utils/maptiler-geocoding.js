
function maptilerGeocoding({ apiKey }) {
  if (!apiKey) throw new Error("MapTiler API key required");

  return {
    forwardGeocode: ({ query, limit = 1 } = {}) => ({
      send: async () => {
        if (!query) throw new Error("query is required for forwardGeocode");
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);
        const body = await res.json();
        return { body };
      }
    }),

    reverseGeocode: ({ query, limit = 1 } = {}) => ({
      send: async () => {
        if (!query || !Array.isArray(query.coordinates)) throw new Error("query.coordinates required as [lng,lat]");
        const [lng, lat] = query.coordinates;
        const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${apiKey}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`);
        const body = await res.json();
        return { body };
      }
    })
  };
}

module.exports = maptilerGeocoding;