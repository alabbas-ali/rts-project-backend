'use strict'

let mapSvgContainer, tip, network

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
    },
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
    REFRESH_INTERVAL = 7000,
    STASTION_STATUS = {
        GREEN: 'GREEN',
        ORANGE: 'ORANGE',
        RED: 'RED',
    },
    LINK_STATUS = {
        GREEN: 'GREEN',
        RED: 'RED',
    }

/*  Node Positions Converters
 *************************************************************/
let spider = {}

const convertNodesIdToPostion = (network) => {
    return network.nodes.map(node => {
        node.x = spider[node.id][0]
        node.y = spider[node.id][1]
        node.status = STASTION_STATUS.GREEN
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
            nodeID: parseInt(link.source, 10),
            type: sourceNode.type
        }
        link.x1 = sourceNode.x
        const num1 = sourceNode.type === 'STASTION' && link.direction === 2 ? 0.5 : 0
        link.y1 = sourceNode.y + num1
        link.target = {
            nodeID: parseInt(link.target, 10),
            type: targetNode.type
        }
        link.x2 = targetNode.x
        const num2 = targetNode.type === 'STASTION' && link.direction === 2 ? 0.5 : 0
        link.y2 = targetNode.y + num2
        return link
    })
    return links
}

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
        .attr('x1', d => d.x1 * ZUME)
        .attr('y1', d => d.y1 * ZUME)
        .attr('x2', d => d.x2 * ZUME)
        .attr('y2', d => d.y2 * ZUME)

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
            .attr('class', ' middle ' + node.type + '-node ' + node.status)
            .attr('id', node.id)
            .attr('x', node.x * ZUME)
            .attr('y', (node.y - 0.2) * ZUME)
            .attr("width", 15)
            .attr("height", 28)
        else
            mapSvgContainer.append('circle')
            .attr('class', ' middle ' + node.type + '-node ' + node.status)
            .attr('id', node.id)
            .attr('cx', node.x * ZUME)
            .attr('cy', node.y * ZUME)
            .attr('r', TYPES_RADIUS[node.type])
    });

}

/* Update Function When there are new Data
 *************************************************************/
const update = (message) => {
    if (!network)
        return null
    
    if (!network.labels) 
        network.labels = []

    switch (message.command) {
        case "InterStation":
            interStation(message)
            break;
        case "InterLine":
            interLine(message)
            break;
        case "ChangeSwitch":
            changeSwitch(message)
            break;
    }

}

const interStation = (message) => {
    // console.log(message)
    var previousLink = network.links.find(
        el => el.target.nodeID === message.station &&
        el.direction === message.direction
    )
    // console.log(previousLink)
    var node = network.nodes.find(
        nd => parseInt(nd.id, 10) === message.station
    )
    if (node.status === STASTION_STATUS.RED) {
        console.error("Cannt Enter a full Station", message)
        //return
    }
    previousLink.status = LINK_STATUS.GREEN
    node.status = node.status === STASTION_STATUS.GREEN ?
        STASTION_STATUS.ORANGE :
        STASTION_STATUS.RED
    updateLine(previousLink)

    let label = network.labels.find(la => la.id === message.train)
    const x = (node.x + 0.1) * ZUME
    const y = message.direction = 1 ? node.y * ZUME : (node.y + 0.6) * ZUME
    if (!label) {
        label = { 
            id: message.train, 
            x, 
            y,
        }
        network.labels.push(label)
        appendLabel(label)
    } else {
        label.x = x
        label.y = y
        updateLabel(label)
    }

    updateStation(node)
}

const interLine = (message) => {
    let link = network.links.find(
        el => el.source.nodeID === message.from &&
        el.target.nodeID === message.to &&
        el.direction === message.direction
    )
    if (link.status === LINK_STATUS.RED) {
        console.error("Cannt Enter a full Line", message)
        //return
    }
    if (link.source.type === 'STASTION') {
        let previousNode = network.nodes.find(
            nd => parseInt(nd.id, 10) === message.from
        )
        previousNode.status = previousNode.status === STASTION_STATUS.ORANGE ?
            STASTION_STATUS.GREEN :
            STASTION_STATUS.ORANGE
        updateStation(previousNode)
    } else if (link.source.type === 'GATE') {
        let previousLink = network.links.find(
            el => el.target.nodeID === message.from &&
            el.direction === message.direction &&
            el.status === LINK_STATUS.RED
        )
        previousLink.status = LINK_STATUS.GREEN
        updateLine(previousLink)
    }else if(link.source.type === 'CONNECTION_GATE'){
        let previousLink = network.links.find(
            el => el.target.nodeID === message.from
        )
        previousLink.status = LINK_STATUS.GREEN
        updateLine(previousLink)
    }

    let label = network.labels.find(la => la.id === message.train)
    const x = (link.x1 * ZUME + link.x2 * ZUME)/2
    const y = message.direction = 1 ?  
        (link.y1 * ZUME + link.y2 * ZUME)/2 :
        ((link.y1 + 0.5) * ZUME + (link.y2 + 0.5) * ZUME)/2
    if (!label) {
        label = { 
            id: message.train, 
            x, 
            y,
        }
        network.labels.push(label)
        appendLabel(label)
    } else {
        label.x = x
        label.y = y
        updateLabel(label)
    }
    
    link.status = LINK_STATUS.RED
    updateLine(link)
}

const changeSwitch = (message) => {
    let Switch = network.nodes.find(
        nd => parseInt(nd.id, 10) === message.switch
    )
    Switch.status = Switch.status === STASTION_STATUS.GREEN ?
        STASTION_STATUS.RED :
        STASTION_STATUS.GREEN
    updateSwitch(Switch)
}

const updateStation = (node) => {
    var indexOfnode = network.nodes.findIndex(i => i.id === node.id)
    network.nodes[indexOfnode].status = node.status
    mapSvgContainer.select("rect[id='" + node.id + "']")
        .attr('class', 'middle ' + node.type + '-node ' + node.status)
}

const updateSwitch = (Switch) => {
    var indexOfSwitch = network.nodes.findIndex(i => i.id === Switch.id)
    network.nodes[indexOfSwitch].status = Switch.status
    mapSvgContainer.select("circle[id='" + Switch.id + "']")
        .attr('class', 'middle ' + Switch.type + '-node ' + Switch.status)
}

const updateLine = (line) => {
    var indexOfline = network.links.findIndex(i => i.source.nodeID === line.source.nodeID && i.target.nodeID === line.target.nodeID)
    network.links[indexOfline].status = line.status
    mapSvgContainer.select("line[source='" + line.source.nodeID + "'][target='" + line.target.nodeID + "']")
        .attr('class', 'connect ' + line.status + '-dimmable')
}

const appendLabel = (label) => {
    mapSvgContainer.append('text')
        .attr('x', label.x)
        .attr('y', label.y)
        .attr('text-anchor', 'middle')
        .attr('class', 'train-label')
        .attr('id', 'lable-' + label.id)
        .text('Train ' +  label.id)
}

const updateLabel = (label) => {
    mapSvgContainer.select("text[id='lable-" + label.id + "']")
        .attr('x', label.x)
        .attr('y', label.y)
}

/* Render Function When there are Network Data
 *************************************************************/
const render = (map) => {

    network = map

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