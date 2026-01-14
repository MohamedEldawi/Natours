import mapboxgl from "mapbox-gl";

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibW9oYW1lZGVsZGF3aTIyIiwiYSI6ImNtazE3ZG5hdzAzYW4zY3M3OGRhYmFlb24ifQ.sHvheI9Hihz2jec9Y5In5Q";
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v11",
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();

  // create marker
  locations.forEach((loc) => {
    const el = document.createElement("div");
    el.className = "marker";
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // create a popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // extend map bounds
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
