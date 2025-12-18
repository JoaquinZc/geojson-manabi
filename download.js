const fs = require('fs');
const path = require('path');

// Ejemplo rápido para filtrar solo Manabí
fetch('https://raw.githubusercontent.com/pabl-o-ce/Ecuador-geoJSON/master/geojson/cantons.geojson')
  .then(res => res.json())
  .then(data => {
    const cantonesManabi = {
      ...data,
      features: data.features.filter(f => f.properties.province === 'Manabí')
    };

    const pathResult = path.join(__dirname, './manabi.geojson');
    fs.writeFile(
      pathResult,
      JSON.stringify(cantonesManabi, null, '\t'),
      () => {
        console.log("Writed.");
      }
    )

    console.log("Downloaded, writing...");
  });