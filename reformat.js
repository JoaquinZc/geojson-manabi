const fs = require('fs')
const path = require('path')

function execute() {
  const route = path.join(__dirname, './ORGANIZACION_TERRITORIAL_PARROQUIAL1_npGaGdg.json')
  const routeOut = path.join(__dirname, './manabi-parroquias-formatted.geojson')
  const file = fs.readFileSync(route, { encoding: 'utf8' })
  const json = JSON.parse(file)
  const formatted = JSON.stringify(json, null, '\t')
  fs.writeFileSync(routeOut, formatted)
}

execute()