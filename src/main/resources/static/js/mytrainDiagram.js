'use strict'

let mapSvgContainer, tip

/*  Node Positions Converters
*************************************************************/
const spider = {
  "1": [7.071067812, 14.82842712],
  "2": [7.071067812, 13.82842712],
  "3": [7.071067812, 12.82842712],
  "4": [7.071067812, 11.82842712],
  "5": [7.778174593, 11.12132034],
  "6": [7.778174593, 10.12132034],
  "7": [7.778174593, 9.121320344],
  "8": [7.778174593, 8.121320344],
  "9": [7.071067812, 7.414213562],
  "10": [6.363961031, 6.707106781],
  "11": [5.656854249, 6],
  "12": [4.949747468, 5.292893219],
  "13": [4.242640687, 4.585786438],
  "14": [3.535533906, 3.878679656],
  "15": [2.828427125, 3.171572875],
  "16": [1.828427125, 3.171572875],
  "17": [0.8284271247, 3.171572875],
  "18": [8.485281374, 11.82842712],
  "19": [9.192388155, 12.53553391],
  "20": [9.899494937, 13.24264069],
  "21": [10.60660172, 13.94974747],
  "22": [10.60660172, 14.94974747],
  "23": [14.43502884, 2.464466094],
  "24": [13.72792206, 3.171572875],
  "25": [13.02081528, 3.878679656],
  "26": [12.3137085, 4.585786438],
  "27": [11.60660172, 5.292893219],
  "28": [10.89949494, 6],
  "29": [10.19238816, 6.707106781],
  "30": [9.485281374, 7.414213562],
  "31": [8.485281374, 7.414213562],
  "32": [7.071067812, 6],
  "33": [6.363961031, 5.292893219],
  "34": [0, 14.48528137],
  "35": [0.7071067812, 13.77817459],
  "36": [1.414213562, 13.07106781],
  "37": [2.121320344, 12.36396103],
  "38": [2.828427125, 11.65685425],
  "39": [3.535533906, 10.94974747],
  "40": [4.242640687, 10.24264069],
  "41": [4.949747468, 9.535533906],
  "42": [5.656854249, 8.828427125],
  "43": [6.363961031, 8.121320344],
  "44": [7.778174593, 6.707106781],
  "45": [8.485281374, 6],
  "46": [8.485281374, 5],
  "47": [8.485281374, 4],
  "48": [8.485281374, 3],
  "49": [8.485281374, 2],
  "50": [8.485281374, 1],
  "51": [8.485281374, 0]
}

const convertNodesIdToPostion = (network) => {
    return network.nodes.map(node => {
        node.x = spider[node.id][0]
        node.y = spider[node.id][1]
        return node
    })
}

const convertLinksToPostions = (network) => {
    const links = network.links.filter( link => {
        const sourceNode = network.nodes.find(it =>  it.id === link.source.toString())
        const targetNode = network.nodes.find(it => it.id === link.target.toString())
        return sourceNode && targetNode
    }).map(link => {
        const sourceNode = network.nodes.find(it =>  it.id === link.source.toString())
        const targetNode = network.nodes.find(it => it.id === link.target.toString())
        link.source = {'nodeID': link.source }
        link.source.x = sourceNode.x
        link.source.y = sourceNode.y
        link.target = { 'nodeID': link.target }
        link.target.x = targetNode.x
        link.target.y = targetNode.y
        return link
    })
    return links
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
    return svg
}

/*  Create NetWork on the Map
*************************************************************/
const renderMap = (mapSvgContainer, network) => {
    const stations = mapSvgContainer.selectAll('.station')
        .data(network.nodes, d => d.name)

    const connections = mapSvgContainer.selectAll('.connect')
        .data(network.links, d => (d.source && d.source.id) + '-' + (d.target && d.target.id))
    
    connections.enter()
        .append('line')
        .attr('class', d => 'connect ' + d.line + '-dimmable')
        .attr('x1', d => d.source.x * 30)
        .attr('y1', d => d.source.y * 30)
        .attr('x2', d => d.target.x * 30)
        .attr('y2', d => d.target.y * 30)
    
    stations.enter()
        .append('circle')
        .attr('class', d => 'station middle station-label ' + d.id + ' ' + d.type)
        .attr('cx', d =>  d.x * 30)
        .attr('cy', d =>  d.y * 30)
        .attr('r', 3)
        .style("fill", d => {
            d.color = colorScale(d.type.replace(/ .*/, ""))
            return d.color
        })
        .style("stroke", d => d3.rgb(colorScale(d.type.replace(/ .*/, ""))).darker(0.1))
        .on('mouseover', d => {
            const xPosition = parseFloat(d.x * 30)
			const yPosition = parseFloat(d.y * 30 + 50)
            d3.select("#tooltip")
				.style("left", xPosition + "px")
				.style("top", yPosition + "px")
				.select("#value")
                .text(d.name)
            d3.select("#tooltip").classed("hidden", false)
        })
        .on('mouseout', _d => {
            d3.select("#tooltip").classed("hidden", true)
        })

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
    
    network.nodes = convertNodesIdToPostion(network)
    network.links = convertLinksToPostions(network)

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