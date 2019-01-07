'use strict'

let mapSvgContainer, tip

/*  Node Positions Converters
 *************************************************************/
let spider = {}

const convertNodesIdToPostion = (network) => {
    return network.nodes.map(node => {
        node.x = spider[node.id][0]
        node.y = spider[node.id][1]
        return node
    })
}

const convertLinksToPostions = (network) => {
    const links = network.links.filter(link => {
        const sourceNode = network.nodes.find(it => it.id === link.source.toString())
        const targetNode = network.nodes.find(it => it.id === link.target.toString())
        return sourceNode && targetNode
    }).map(link => {
        const sourceNode = network.nodes.find(it => it.id === link.source.toString())
        const targetNode = network.nodes.find(it => it.id === link.target.toString())
        link.source = {
            'nodeID': link.source,
            'type' : sourceNode.type
        }
        link.source.x = sourceNode.x
        link.source.y = sourceNode.y
        link.target = {
            'nodeID': link.target,
            'type' : targetNode.type
        }
        link.target.x = targetNode.x
        link.target.y = targetNode.y
        return link
    })
    return links
}

/*  Constants Decleration Section
 *************************************************************/

const PARENT_TAG_ID = "#chart",
    ZUME = 30,
    OPACITY = {
        NODE_DEFAULT: 0.9,
        NODE_FADED: 0.1,
        NODE_HIGHLIGHT: 0.8,
        LINK_DEFAULT: 0.6,
        LINK_FADED: 0.05,
        LINK_HIGHLIGHT: 0.9
    },
    TYPES = ['GATE', 'CONNECTION_GATE', 'STASTION', ],
    TYPES_RADIUS = {
        'GATE': 3,
        'CONNECTION_GATE': 6,
        'STASTION': 2
    },
    TYPE_COLORS = ["#1b9e77", "#d95f02", "#7570b3"],
    TYPE_HIGHLIGHT_COLORS = ["#66c2a5", "#fc8d62", "#8da0cb"],
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

    const nodes = mapSvgContainer.selectAll('.station')
        .data(network.nodes, d => d.name)

    const connections = mapSvgContainer.selectAll('.connect')
        .data(network.links, d => (d.source && d.source.id) + '-' + (d.target && d.target.id))

    connections.enter()
        .append('line')
        .attr('class', d => 'connect ' + d.status + '-dimmable')
        .attr('source', d => d.source.nodeID)
        .attr('target', d => d.target.nodeID)
        .attr('x1', d => d.source.x * ZUME)
        .attr('y1', d => {
            const num = d.source.type === 'STASTION' && d.direction === 2 ? 0.5 : 0
            return (d.source.y + num) * ZUME
        })
        .attr('x2', d => d.target.x * ZUME)
        .attr('y2', d => {
            const num = d.target.type === 'STASTION' && d.direction === 2 ? 0.5 : 0
            return (d.target.y + num) * ZUME
        })

    // connections.enter()
    //     .append('text')
    //     .attr('x', d => (d.source.x * ZUME + d.target.x * ZUME)/2)
    //     .attr('y', d => (d.source.y * ZUME + d.target.y * ZUME)/2)
    //     .attr('text-anchor', 'middle')
    //     .attr('class', 'connect label')
    //     .text(d=> d.source.nodeID + '-' + d.target.nodeID)

    nodes.enter()
        .append('text')
        .attr('x', d => (d.x * ZUME))
        .attr('y', d => (d.y * ZUME - 10))
        .attr('text-anchor', 'middle')
        .attr('class', ' label')
        .text(d => d.name)

    network.nodes.forEach(node => {
        if (node.type == 'STASTION')
            mapSvgContainer.append('rect')
            .attr('class',' middle station-label ' + node.id + ' ' + node.type)
            .attr('id', node.id)
            .attr('x', node.x * ZUME)
            .attr('y', (node.y - 0.2) * ZUME)
            .attr("width", 15)
            .attr("height", 28)
            .style("fill", colorScale(node.type.replace(/ .*/, "")))
            .style("stroke", d3.rgb(colorScale(node.type.replace(/ .*/, ""))).darker(0.1))
            .on('mouseover', d => {
                const xPosition = parseFloat(node.x * ZUME)
                const yPosition = parseFloat(node.y * ZUME + 80)
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .select("#value")
                    .text(node.name + ' ' + node.id)
                d3.select("#tooltip").classed("hidden", false)
            })
            .on('mouseout', _d => {
                d3.select("#tooltip").classed("hidden", true)
            })
        else
            mapSvgContainer.append('circle')
            .attr('class', ' middle station-label ' + node.id + ' ' + node.type)
            .attr('id', node.id)
            .attr('cx', node.x * ZUME)
            .attr('cy', node.y * ZUME)
            .attr('r', TYPES_RADIUS[node.type])
            .style("fill", colorScale(node.type.replace(/ .*/, "")))
            .style("stroke", d3.rgb(colorScale(node.type.replace(/ .*/, ""))).darker(0.1))
            .on('mouseover', d => {
                const xPosition = parseFloat(node.x * ZUME)
                const yPosition = parseFloat(node.y * ZUME + 80)
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .select("#value")
                    .text(node.name + ' ' + node.id)
                d3.select("#tooltip").classed("hidden", false)
            })
            .on('mouseout', _d => {
                d3.select("#tooltip").classed("hidden", true)
            })
    });

}

/* Update Function When there are new Data
 *************************************************************/
const update = (message) => {
    console.log(message)
    if (message.id)
        updateCircle(node)
    else(message.target)
    updateLine(node)
}

const updateCircle = (node) => {
    //console.log("Change Circle {" + node.id + "," + node.type  + "," + node.name + "," + "}")
    mapSvgContainer.select("circle[id='" + node.id + "']")
        .style("fill", d => {
            d.color = colorScale(node.type.replace(/ .*/, ""))
            return d.color
        })
        .style("stroke", _d => d3.rgb(colorScale(node.type.replace(/ .*/, ""))).darker(0.1))
}

const updateLine = (node) => {
    //console.log("Change Line {" + node.source + "," + node.target  + "," + node.status + "," + "}")
    mapSvgContainer.select("line[source='" + node.source + "'][target='" + node.target + "']")
        .attr('class', 'connect ' + node.status + '-dimmable')
}

/* Render Function When there are Network Data
 *************************************************************/
const render = (network) => {

    if (!mapSvgContainer)
        mapSvgContainer = createMap(PARENT_TAG_ID)

    network.nodes = convertNodesIdToPostion(network)
    network.links = convertLinksToPostions(network)

    renderMap(mapSvgContainer, network)
}

/* 1. Load and pre-process the data
 *************************************************************/
$.getJSON("spider.json", spiders => {
    spider = spiders

    $.getJSON("/railway/status", data => {
        if (data.status === 'SUCCESS') {
            connect()
            render(data.result)
        }
    })
})