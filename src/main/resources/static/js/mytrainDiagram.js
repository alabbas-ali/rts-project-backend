'use strict'

let mapSvgContainer, tip

/*  Node Positions
*************************************************************/
const spider = {
  "place-asmnl": [7.071067812, 14.82842712],
  "place-smmnl": [7.071067812, 13.82842712],
  "place-fldcr": [7.071067812, 12.82842712],
  "place-shmnl": [7.071067812, 11.82842712],
  "place-jfk": [7.778174593, 11.12132034],
  "place-andrw": [7.778174593, 10.12132034],
  "place-brdwy": [7.778174593, 9.121320344],
  "place-sstat": [7.778174593, 8.121320344],
  "place-dwnxg": [7.071067812, 7.414213562],
  "place-pktrm": [6.363961031, 6.707106781],
  "place-chmnl": [5.656854249, 6],
  "place-knncl": [4.949747468, 5.292893219],
  "place-cntsq": [4.242640687, 4.585786438],
  "place-harsq": [3.535533906, 3.878679656],
  "place-portr": [2.828427125, 3.171572875],
  "place-davis": [1.828427125, 3.171572875],
  "place-alfcl": [0.8284271247, 3.171572875],
  "place-nqncy": [8.485281374, 11.82842712],
  "place-wlsta": [9.192388155, 12.53553391],
  "place-qnctr": [9.899494937, 13.24264069],
  "place-qamnl": [10.60660172, 13.94974747],
  "place-brntn": [10.60660172, 14.94974747],
  "place-wondl": [14.43502884, 2.464466094],
  "place-rbmnl": [13.72792206, 3.171572875],
  "place-bmmnl": [13.02081528, 3.878679656],
  "place-sdmnl": [12.3137085, 4.585786438],
  "place-orhte": [11.60660172, 5.292893219],
  "place-wimnl": [10.89949494, 6],
  "place-aport": [10.19238816, 6.707106781],
  "place-mvbcl": [9.485281374, 7.414213562],
  "place-aqucl": [8.485281374, 7.414213562],
  "place-gover": [7.071067812, 6],
  "place-bomnl": [6.363961031, 5.292893219],
  "place-forhl": [0, 14.48528137],
  "place-grnst": [0.7071067812, 13.77817459],
  "place-sbmnl": [1.414213562, 13.07106781],
  "place-jaksn": [2.121320344, 12.36396103],
  "place-rcmnl": [2.828427125, 11.65685425],
  "place-rugg": [3.535533906, 10.94974747],
  "place-masta": [4.242640687, 10.24264069],
  "place-bbsta": [4.949747468, 9.535533906],
  "place-tumnl": [5.656854249, 8.828427125],
  "place-chncl": [6.363961031, 8.121320344],
  "place-state": [7.778174593, 6.707106781],
  "place-haecl": [8.485281374, 6],
  "place-north": [8.485281374, 5],
  "place-ccmnl": [8.485281374, 4],
  "place-sull": [8.485281374, 3],
  "place-welln": [8.485281374, 2],
  "place-mlmnl": [8.485281374, 1],
  "place-ogmnl": [8.485281374, 0]
}

const idToNodeFn = (nodes) => {
    return nodes.map( node => {
        node.x = spider[node.id][0]
        node.y = spider[node.id][1]
        return node
    })
}

/*  Constants Decleration Section
*************************************************************/
const PARENT_TAG_ID = "#chart",
    OPACITY = {
        NODE_DEFAULT: 0.9,
        NODE_FADED: 0.1,
        NODE_HIGHLIGHT: 0.8,
        LINK_DEFAULT: 0.6,
        LINK_FADED: 0.05,
        LINK_HIGHLIGHT: 0.9
    },
    TYPES = ["gate", "connectionGate", "switch", "station", "sensor"],
    TYPE_COLORS = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e"],
    TYPE_HIGHLIGHT_COLORS = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"],
    LINK_COLOR = "#b3b3b3",
    INFLOW_COLOR = "#2E86D1",
    OUTFLOW_COLOR = "#D63028",
    NODE_WIDTH = 36,
    COLLAPSER = {
        RADIUS: NODE_WIDTH / 2,
        SPACING: 2
    },
    OUTER_MARGIN = 10,
    MARGIN = {
        TOP: 2 * (COLLAPSER.RADIUS + OUTER_MARGIN),
        RIGHT: OUTER_MARGIN,
        BOTTOM: OUTER_MARGIN,
        LEFT: OUTER_MARGIN
    },
    LAYOUT_INTERATIONS = 32,
    REFRESH_INTERVAL = 7000;

const colorScale = d3.scaleOrdinal().domain(TYPES).range(TYPE_COLORS)
const highlightColorScale = d3.scaleOrdinal().domain(TYPES).range(TYPE_HIGHLIGHT_COLORS)

/*  Create The Map Continer
*************************************************************/
const createMap = (parentTagID) => {
    const width = $(parentTagID).width()
    const height = $(parentTagID).height()
    const svg = d3.select(parentTagID).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append('g', 'map-container')
        .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.TOP + ")")
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(d => d.name)
    svg.call(tip)
    return svg
}


/*  Create NetWork on the Map
*************************************************************/
const renderMap = (mapSvgContainer, network) => {
    const stations = mapSvgContainer.selectAll('.station')
        .data(network.nodes, d => d.name)

    const connections = mapSvgContainer.selectAll('.connect')
        .data(network.links, d => (d.source && d.source.id) + '-' + (d.target && d.target.id))
    
    connections
        .enter()
      .append('line')
        .attr('class', d => 'connect ' + d.line + '-dimmable')
        .attr('x1', d => d.sourc)
        .attr('y1', d => d.sourc)
        .attr('x2', d => d.target)
        .attr('y2', d => d.target)

    connections
        .attr('x1', d => d.sourc)
        .attr('y1', d => d.sourc)
        .attr('x2', d => d.target)
        .attr('y2', d => d.target)
    
    stations
        .enter()
      .append('circle')
        .attr('class', d => 'station middle station-label ' + d.id)
        .on('mouseover', d => {
            if (d < 30) {
                tip.direction('e').offset([0, 10])
            } else {
                tip.direction('n').offset([-10, 0])
            }
            tip.show(d);
            highlightMareyTitle(d.id, _.unique(d.links.map(link => { return link.line })))
        })
        .on('mouseout', d => {
            tip.hide(d) 
            highlightMareyTitle(null)
        })
        .attr('cx', d =>  d.x * 30)
        .attr('cy', d =>  d.y * 30)
        .attr('r', 3)

    stations
        .attr('cx', d => d.x * 30)
        .attr('cy', d => d.y * 30)
        .attr('r', 3)

}

/* Update Function When there are new Data
*************************************************************/
const update = (network) => {
    
    if (!mapSvgContainer)
        mapSvgContainer = createMap(PARENT_TAG_ID)
    
    network.nodes = idToNodeFn(network.nodes)

    renderMap(mapSvgContainer, network)
    
}

/* 1. Load and pre-process the data
*************************************************************/
$.getJSON("stations.json", function (network) {
    update(network)
});




// const formatNumber = (d) => {
//     var numberFormat = d3.format(",.0f"); // zero decimal places
//     return "£" + numberFormat(d);
// }

// const formatFlow = (d) => {
//     var flowFormat = d3.format(",.0f"); // zero decimal places with sign
//     return "£" + flowFormat(Math.abs(d)) + (d < 0 ? " CR" : " DR");
// }