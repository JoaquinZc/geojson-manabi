const mapLink = 'https://raw.githubusercontent.com/JoaquinZc/geojson-manabi/main/manabi.geojson';
const mapLinkByParroquia = 'https://raw.githubusercontent.com/JoaquinZc/geojson-manabi/main/manabi-parroquias-cformatted.geojson';

const getVariableCanton = () => {
  const variables = context.grafana.replaceVariables("${canton}");
  const variablesWithOutSeperator = variables.replace("{", "").replace("}", "")
  const variableList = variablesWithOutSeperator.split(",");
  return variableList;
}

const getMapManabi = () => {
  let map = null;

  context.panel.data.series.forEach((e) => {
    if (e.name === "CM" && e.fields.length === 1) {
      map = {
        type: "FeatureCollection",
        features: JSON.parse(e.fields[0].values[1])
      };
      return;
    }
  });

  return [map, "Manabi"];
}

const getMap = () => {
  let map = null;
  const var_canton = getVariableCanton();

  if (var_canton.length !== 1) {
    return getMapManabi();
  }

  context.panel.data.series.forEach((e) => {
    if (e.name === "PM" && e.fields.length === 1) {
      const features = JSON.parse(e.fields[0].values[1]);

      map = {
        type: "FeatureCollection",
        features: features.filter((feature) => feature.properties.DPA_DESCAN === var_canton[0])
      };

      return;
    }
  });

  return [map, var_canton[0]];
}

const registerMap = (map, name) => {
  const mapFilterString = JSON.stringify(map);
  context.echarts.registerMap(name ?? "Manabi", mapFilterString);
}

const changeMap = (name) => {
  context.panel.chart.setOption(loadMap(name ?? "Manabi"));
  context.panel.chart.resize();
}

const getDataManabi = () => {
  let allCantones, cantidades;

  context.panel.data.series.map((s) => {
    if (s.refId !== 'A') {
      return;
    }

    allCantones = (s.fields ?? []).find((field) => field.name === 'canton')?.values ?? [];
    cantidades = (s.fields ?? []).find((field) => field.name === 'cantidad')?.values ?? [];
  });

  const cantones = [];

  for (idxCanton in allCantones) {
    const canton = allCantones[idxCanton];
    const cantidad = cantidades[idxCanton];

    cantones.push({ name: canton, value: cantidad });
  }

  return cantones;
}

const getData = () => {
  let allParroquias, cantidades;
  const var_canton = getVariableCanton();

  if (var_canton.length !== 1) {
    return getDataManabi();
  }

  context.panel.data.series.map((s) => {
    if (s.refId !== 'B') {
      return;
    }

    allParroquias = (s.fields ?? []).find((field) => field.name === 'parroquia')?.values ?? [];
    cantidades = (s.fields ?? []).find((field) => field.name === 'cantidad')?.values ?? [];
  });

  const parroquias = [];

  for (idxParroquia in allParroquias) {
    const parroquia = allParroquias[idxParroquia];
    const cantidad = cantidades[idxParroquia];

    parroquias.push({ name: parroquia, value: cantidad });
  }

  return parroquias;
}

const loadMap = (nameMap, data) => {
  return {
    title: {
      text: 'Plantas entregadas',
      subtext: 'Desde 2019'
    },
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      transitionDuration: 0.2
    },
    visualMap: {
      left: 'right',
      min: Math.min(...data.map(o => o.value)),
      max: Math.max(...data.map(o => o.value)),
      inRange: {
        color: [
          '#E0F7FA',  // Azul muy claro
          '#B2EBF2',
          '#80DEEA',
          '#4DD0E1',
          '#26C6DA',
          '#2DB9DF',  // Color base
          '#00ACC1',
          '#0097A7',
          '#00838F',
          '#006064'   // Azul oscuro
        ]
      },
      text: ['Entregas máxixmas', 'Entregas mínimas'],
      calculable: true,
      orient: 'vertical'
    },
    toolbox: {
      show: true,
      top: 'top',
      feature: {
        dataView: { readOnly: false },
        saveAsImage: {}
      }
    },
    series: [
      {
        name: 'Plantas entregadas',
        type: 'map',
        roam: false,
        map: nameMap,
        emphasis: {
          label: {
            show: true
          }
        },
        data: data
      }
    ]
  };
}

const loadMapInit = () => {
  return {
    title: {
      text: 'Plantas entregadas',
      subtext: 'Desde 2019'
    },
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      transitionDuration: 0.2
    },
    toolbox: {
      show: true,
      top: 'top',
      feature: {
        dataView: { readOnly: false },
        saveAsImage: {}
      }
    },
    series: [
      {
        name: 'Plantas entregadas',
        type: 'map',
        roam: false,
        map: 'world',
        emphasis: {
          label: {
            show: true
          }
        },
        data: []
      }
    ]
  };
}

//return loadMapInit();

try {
  const [mapLoaded, mapName] = getMap();
  const data = getData();

  console.log(mapLoaded, mapName, data)

  registerMap(mapLoaded, mapName)

  return loadMap(mapName, data)
} catch (e) {
  console.log(e)
  return loadMapInit()
}