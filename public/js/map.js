 maptilersdk.config.apiKey = mapToken;

      const map = new maptilersdk.Map({
        container: 'map', // container's id or the HTML element to render the map
        style: "streets-v2",
        center: listing.geometry.coordinates,
        zoom:9
      });

      // const el = document.createElement('img');
      // el.src = '/images/air.png';
      // el.alt = "Wanderlust location";
      // el.style.width = "30px";
      // el.style.height = "30px";
      // el.style.objectFit = "contain";
    
const marker = new maptilersdk.Marker({color:"red"})
.setLngLat(listing.geometry.coordinates)
  .setPopup( new maptilersdk.Popup({offset: 25})
  .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`))
  .addTo(map);
