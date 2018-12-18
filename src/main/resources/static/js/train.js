/**
 * the-trains.js
 *
 * Copyright 2014 Michael Barry & Brian Card.  MIT open-source lincense.
 *
 * Display marey diagrams and map glyph for "The Trains" section of the
 * visualization in the following stages:
 *
 * 1. Load the required data and do some pre-processing
 * 2. Render the side map glyph that shows locations of trains at a point in time
 * 3. Set up the scaffolding for lined-up and full Marey diagrams
 * 4. On load and when the screen width changes:
 *   4a. Render the full Marey
 *   4b. Render annotations for the full Marey
 *   4c. Render the lined-up Marey
 *   4d. Set up listener to zoom in on a particular trip of the lined-up marey when user clicks on it
 * 5. Add interaction behavior with surrounding text
 *
 * Interaction is added to all elements throughout as they are rendered.
 */
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
};


/* 1. Load and pre-process the data
 *************************************************************/
$.getJSON("stations.json", function (network) {
  "use strict";

  var idToNode = {};
  network.nodes.forEach(function (data) {
    data.x = spider[data.id][0];
    data.y = spider[data.id][1];
    idToNode[data.id] = data;
  });
  network.links.forEach(function (link) {
    link.source = network.nodes[link.source];
    link.target = network.nodes[link.target];
    link.source.links = link.source.links || [];
    link.target.links = link.target.links || [];
    link.target.links.splice(0, 0, link);
    link.source.links.splice(0, 0, link);
  });
  
  var stationToName = {};
  var end = {};
  var nodesPerLine = network.nodes.map(function (d) {
    return d.links.map(function (link) {
      var key = d.id + '|' + link.line;
      if (d.links.length === 1) { end[key] = true; }
      stationToName[key] = d.name;
      return key;
    });
  });
  var mapGlyphTrainCircleRadius = 2.5;
  //nodesPerLine = _.unique(_.flatten(nodesPerLine));





  /* 2. Render the side map glyph that shows locations of trains
   *    at a point in time
   *************************************************************/
  var fixedLeft = d3.select(".fixed-left");
  var mapGlyphSvg = fixedLeft.select('.side-map').append('svg');

  function renderSideMap(mapGlyphContainer, outerWidth, outerHeight) {
    var mapGlyphMargin = {top: 30, right: 30, bottom: 10, left: 10};
    var xRange = d3.extent(network.nodes, function (d) { return d.x; });
    var yRange = d3.extent(network.nodes, function (d) { return d.y; });
    var width = outerWidth - mapGlyphMargin.left - mapGlyphMargin.right,
        height = Math.max(outerHeight - mapGlyphMargin.top - mapGlyphMargin.bottom - $('.side-caption').height() - 40, 150);
    var xScale = width / (xRange[1] - xRange[0]);
    var yScale = height / (yRange[1] - yRange[0]);
    var scale = Math.min(xScale, yScale);
    network.nodes.forEach(function (data) {
      data.pos = [data.x * scale, data.y * scale];
    });
    var endDotRadius = 0.2 * scale;
    var mapGlyph = mapGlyphContainer
        .attr('width', scale * (xRange[1] - xRange[0]) + mapGlyphMargin.left + mapGlyphMargin.right)
        .attr('height', scale * (yRange[1] - yRange[0]) + mapGlyphMargin.top + mapGlyphMargin.bottom)
      .appendOnce('g', 'map-container')
        .attr('transform', 'translate(' + mapGlyphMargin.left + ',' + mapGlyphMargin.top + ')');

    var stations = mapGlyph.selectAll('.station')
        .data(network.nodes, function (d) { return d.name; });

    var connections = mapGlyph.selectAll('.connect')
        .data(network.links, function (d) { return (d.source && d.source.id) + '-' + (d.target && d.target.id); });

    connections
        .enter()
      .append('line')
        .attr('class', function (d) { return 'connect ' + d.line + '-dimmable'; })
        .attr('x1', function (d) { return d.source.pos[0]; })
        .attr('y1', function (d) { return d.source.pos[1]; })
        .attr('x2', function (d) { return d.target.pos[0]; })
        .attr('y2', function (d) { return d.target.pos[1]; });

    connections
        .attr('x1', function (d) { return d.source.pos[0]; })
        .attr('y1', function (d) { return d.source.pos[1]; })
        .attr('x2', function (d) { return d.target.pos[0]; })
        .attr('y2', function (d) { return d.target.pos[1]; });

    stations
        .enter()
      .append('circle')
        .attr('class', function (d) { return 'station middle station-label ' + d.id; })
        .on('mouseover', function (d) {
          if (d.pos[1] < 30) {
            tip.direction('e')
              .offset([0, 10]);
          } else {
            tip.direction('n')
              .offset([-10, 0]);
          }
          tip.show(d);
          highlightMareyTitle(d.id, _.unique(d.links.map(function (link) { return link.line; })));
        })
        .on('mouseout', function (d) {
          tip.hide(d);
          highlightMareyTitle(null);
        })
        .attr('cx', function (d) { return d.pos[0]; })
        .attr('cy', function (d) { return d.pos[1]; })
        .attr('r', 3);

    stations
        .attr('cx', function (d) { return d.pos[0]; })
        .attr('cy', function (d) { return d.pos[1]; })
        .attr('r', 3);

    // line color circles
    function dot(id, clazz) {
      mapGlyph.selectAll('circle.' + id)
        .classed(clazz, true)
        .classed('end', true)
        .classed('middle', false)
        .attr('r', Math.max(endDotRadius, 3));
    }
    dot('place-asmnl', "red");
    dot('place-alfcl', "red");
    dot('place-brntn', "red");
    dot('place-wondl', "blue");
    dot('place-bomnl', "blue");
    dot('place-forhl', "orange");
    dot('place-ogmnl', "orange");
  }




  




  /* 4. On load and when the screen width changes
   *
   * This section makes heavy use of a utility defined in
   * common.js 'appendOnce' that when called adds a new element
   * or returns the existing element if it already exists.
   *************************************************************/
   // first some state shared across re-renderings
  var frozen = false;
  var showingMap = false;
  var highlightedLinedUpMarey = null;
  var highlightedTrip = null;
  var hoveredTrip = null;
  var lastWidth = null;

  // the method that actually gets called on screen size chages
  function renderMarey(outerSvg, fullMareyOuterWidth) {
    fullMareyOuterWidth = Math.round(fullMareyOuterWidth);
    if (fullMareyOuterWidth === lastWidth) { return; }
    lastWidth = fullMareyOuterWidth;



    /* 4a. Render the full Marey
     *************************************************************/
    var fullMareyMargin = {top: 100, right: 200, bottom: 0, left: 60};
    var fullMareyOuterHeight = 3500;
    var fullMareyWidth = fullMareyOuterWidth - fullMareyMargin.left - fullMareyMargin.right,
        fullMareyHeight = fullMareyOuterHeight - fullMareyMargin.top - fullMareyMargin.bottom;
    outerSvg.attr('width', fullMareyOuterWidth)
        .attr('height', fullMareyOuterHeight);

    var fullMareyHeader = outerSvg.appendOnce('g', 'header')
        .attr('transform', 'translate(' + fullMareyMargin.left + ',0)');
    var fullMareyBodyContainer = outerSvg.appendOnce('g', 'main')
        .attr('transform', 'translate(' + fullMareyMargin.left + ', ' + fullMareyMargin.top + ')');
    var fullMareyBackground = fullMareyBodyContainer.appendOnce('g', 'background');
    var fullMareyForeground = fullMareyBodyContainer.appendOnce('g', 'foreground');

    var xScale = d3.scale.linear()
        .domain(xExtent)
        .range([0, fullMareyWidth]);
    var yScale = d3.scale.linear()
      .domain([
        minUnixSeconds,
        maxUnixSeconds
      ]).range([15, fullMareyHeight]).clamp(true);

    var timeScale = d3.time.scale()
      .domain([new Date(minUnixSeconds * 1000), new Date(maxUnixSeconds * 1000)])
      .range([15, fullMareyHeight]);

    // draw the station label header aross the top
    var keys = d3.keys(header);
    var stationXScale = d3.scale.ordinal()
        .domain(keys)
        .range(keys.map(function (d) { return xScale(header[d][0]); }));
    var stationXScaleInvert = {};
    keys.forEach(function (key) {
      stationXScaleInvert[header[key][0]] = key;
    });

    var stationLabels = fullMareyHeader.selectAll('.station-label')
        .data(nodesPerLine);

    stationLabels
        .enter()
      .append('text')
        .attr('class', 'station-label')
        .style('display', function (d) { return end[d] ? null : 'none'; })
        .style('text-anchor', 'start')
        .text(function (d) { return VIZ.fixStationName(stationToName[d]); });

    stationLabels
        .attr('transform', function (d) { return 'translate(' + (stationXScale(d) - 2) + ',' + (fullMareyMargin.top - 3) + ')rotate(-70)'; });

    var stations = fullMareyForeground.selectAll('.station')
        .data(nodesPerLine, function (d) { return d; });

    stations
        .enter()
      .append('line')
        .attr('class', function (d) { return 'station ' + d.replace('|', '-'); });

    stations
        .attr('x1', function (d) { return xScale(header[d][0]); })
        .attr('x2', function (d) { return xScale(header[d][0]); })
        .attr('y1', 0)
        .attr('y2', fullMareyHeight);

    // draw the tall time axis down the side
    var yAxis = d3.svg.axis()
      .tickFormat(function (d) { return moment(d).zone(5).format("h:mm A"); })
      .ticks(d3.time.minute, 15)
      .scale(timeScale)
      .orient("left");
    fullMareyForeground.appendOnce('g', 'y axis').call(yAxis);
    var lineMapping = d3.svg.line()
      .x(function(d) { return d[0]; })
      .y(function(d) { return d[1]; })
      .defined(function (d) { return d !== null; })
      .interpolate("linear");
    var mareyLines = fullMareyForeground.selectAll('.mareyline')
        .data(trips, function (d) { return d.trip; });

    if (!VIZ.ios) {
      fullMareyForeground.firstTime
          .onOnce('mouseover', 'path.mareyline', hoverTrain)
          .onOnce('mouseout', 'path.mareyline', unHoverTrain)
          .onOnce('click', 'path.mareyline', highlightTrain);
    }
    mareyLines
        .enter()
      .append('path')
        .attr('class', function (d) { return 'mareyline hoverable highlightable dimmable ' + d.line; });
    mareyLines
        .attr('transform', function (d) {
          if (!d.origY) { d.origY = yScale(d.stops[0].time); }
          return 'translate(0,' + d.origY + ')';
        })
        .attr('d', draw(xScale, yScale));
    mareyContainer.select('.fixed-right').on('mousemove', selectTime);
    mareyContainer.select('.fixed-right').on('mousemove.titles', updateTitle);
    var barBackground = fullMareyBackground.appendOnce('g', 'g-bar hide-on-ios');
    var barForeground = fullMareyForeground.appendOnce('g', 'g-bar hide-on-ios');
    barBackground.appendOnce('line', 'bar')
        .attr('x1', 1)
        .attr('x2', fullMareyWidth)
        .attr('y1', 0)
        .attr('y2', 0);
    barForeground.appendOnce('rect', 'text-background').firstTime
      .attr('x', 3)
      .attr('y', -14)
      .attr('width', 45)
      .attr('height', 12);
    barForeground.appendOnce('text', 'marey-time').firstTime
      .attr('dx', 2)
      .attr('dy', -4);
    timeDisplay = mareyContainer.selectAll('.marey-time');
    var bar = mareyContainer.selectAll("g.g-bar");

    // If a previous time was selected, then select that time again now
    if (!lastTime) {
      select(minUnixSeconds);
    }

    // on hover, show the station you are hovered on
    function updateTitle() {
      var pos = d3.mouse(fullMareyForeground.node());
      var x = pos[0];
      var station = stationXScaleInvert[Math.round(xScale.invert(x))];
      if (station) {
        highlightMareyTitle(station);
      }
    }

    // on hover, set the time that is displayed in the map glyph on the side
    function selectTime() {
      var pos = d3.mouse(fullMareyForeground.node());
      var y = pos[1];
      var x = pos[0];
      if (x > 0 && x < fullMareyWidth) {
        var time = yScale.invert(y);
        select(time);
      }
    }

    // actually set the time for the map glyph once the time is determined
    function select(time) {
      var y = yScale(time);
      bar.attr('transform', 'translate(0,' + y + ')');
      timeDisplay.text(moment(time * 1000).zone(5).format('h:mm a'));
      renderTrainsAtTime(time);
    }

    // Get a list of [x, y] coordinates for all train trips for
    // both the full Marey and the lined-up Marey
    function getPointsFromStop(xScale, yScale, d, relative) {
      var last = null;
      var stops = d.stops.map(function (stop) {
        // special case: place-jfk, place-nqncy -> place-jfk, place-asmnl (at same time), place-nqncy 
        // special case: place-nqncy, place-jfk -> place-nqncy, place-asmnl (at same time), place-jfk
        var result;
        if (last && last.stop === 'place-jfk' && stop.stop === 'place-nqncy') {
          result = [null, {stop: 'place-asmnl', time: last.time}, stop];
        } else if (last && last.stop === 'place-nqncy' && stop.stop === 'place-jfk') {
          result = [{stop: 'place-asmnl', time: stop.time}, null, stop];
        } else {
          result = [stop];
        }
        last = stop;
        return result;
      });
      var flattenedStops = _.flatten(stops);
      var startX = xScale(header[d.stops[0].stop + '|' + d.line][0]);
      var points = flattenedStops.map(function (stop) {
        if (!stop) { return null; }
        var y = yScale(stop.time) - yScale(flattenedStops[0].time);
        var x = xScale(header[stop.stop + '|' + d.line][0]);
        if (relative) {
          x -= startX;
        }
        return [x, y];
      });
      return points;
    }
    function draw(xScale, yScale, relative) {
      return function (d) {
        var points = getPointsFromStop(xScale, yScale, d, relative);
        return lineMapping(points);
      };
    }





    /* 4b. Render annotations for the full Marey
     *************************************************************/
    var annotationContainer = outerSvg.appendOnce('g', 'annotations')
        .attr('transform', 'translate(' + fullMareyMargin.left + ', ' + fullMareyMargin.top + ')');
    var annotations = annotationContainer.selectAll('.annotation').data(sideAnnotationData);
    annotations
        .enter()
      .append('g')
        .attr('class', 'annotation')
      .append('text');

    annotations.selectAll('text')
        .attr('id', function (d) { return d.id; })
        .text(function (d) { return d.text; })
        .call(VIZ.wrap, fullMareyMargin.right - 20);

    var connections = annotations.selectAll('.annotation-connection')
        .data(function (d) { return (d.connections || []).map(function (c) { c.parent = d; return c; }); });

    connections.enter()
      .append('path')
        .attr('class', 'annotation-connection');

    // Draw annotation lines
    connections
        .attr('d', function (connection) {
          var station = network.nodes.find(function (station) { return new RegExp(connection.station, 'i').test(station.name); });
          var annotationY = yScale(moment(connection.parent.time + ' -0500', 'YYYY/MM/DD HH:m ZZ').valueOf() / 1000) - 4;
          var connectionStartY = yScale(moment(connection.start + ' -0500', 'YYYY/MM/DD HH:m ZZ').valueOf() / 1000);
          var connectionEndY = yScale(moment(connection.stop + ' -0500', 'YYYY/MM/DD HH:m ZZ').valueOf() / 1000);
          var connectionSingleY = yScale(moment(connection.time + ' -0500', 'YYYY/MM/DD HH:m ZZ').valueOf() / 1000);
          var connectionX = xScale(header[station.id + '|' + connection.line][0]);
          return 'M' + [
            [
              [fullMareyWidth + 10, annotationY],
              [
                connection.time ? connectionX : connectionX + 3,
                connection.time ? connectionSingleY : (connectionStartY + connectionEndY) / 2
              ]
            ],
            !connection.time ? [
              [connectionX, connectionStartY],
              [connectionX + 3, connectionStartY],
              [connectionX + 3, connectionEndY],
              [connectionX, connectionEndY]
            ] : null
          ].filter(function (d) { return !!d; }).map(function (segment) { return segment.map(function (point) { return point.map(Math.round).join(','); }).join('L'); }).join('M');
        });

    annotationContainer.selectAll('text, text tspan')
        .attr('x', fullMareyWidth + 15)
        .attr('y', function (d) { return yScale(moment(d.time + ' -0500', 'YYYY/MM/DD HH:m ZZ').valueOf() / 1000); });


    // add links to annotations if they are set
    // find the text elements that need links
    var annotationsWithLinks = annotationContainer.selectAll('text tspan')
      .filter(function (d) {
        if (d.link && d3.select(this).text().indexOf(d.link.text) > -1) {
          return this;
        }
        return null;
      });

    // clear previous underlines
    annotationContainer.selectAll('polyline').remove();

    annotationsWithLinks.each(function (d) {
      // split into three parts, start text, link, end text
      var thisSelection = d3.select(this);
      var text = thisSelection.text();
      thisSelection.text(text.substring(0, text.indexOf(d.link.text)));
      var endText = text.substring(text.indexOf(d.link.text) + d.link.text.length, text.length);

      var parentNode = d3.select(this);
      var offset = parentNode.node().getComputedTextLength();
      var clicked = false;
      var linkNode = parentNode.append('tspan')
        .text(d.link.text)
        .attr('class', 'click-link')
        .on('click', function (d) {
          clicked = !clicked;
          if (clicked) {
            highlightTrain({'trip': d.link.trip });
          } else {
            highlightTrain(null);
          }
        })
        .on('mouseover', function (d) {
          if (d.link.trip !== highlightedTrip && clicked) {
            clicked = false;
          }
          highlightTrain({'trip': d.link.trip });
          underline.style('stroke-dasharray', '3,0');
        })
        .on('mouseout', function () {
          if (!clicked) {
            highlightTrain(null);
          }
          underline.style('stroke-dasharray', '3,3');
        });

      parentNode.append('tspan')
        .text(endText);

      // add the underline
      var annoationGElement = this.parentNode.parentNode;
      var underline = d3.select(annoationGElement).append('polyline')
         .attr('class', 'click-link')
         .attr('points', function() {
          var textStart = offset + parseInt(parentNode.attr('x'), 10);
          var textEnd = textStart + linkNode.node().getComputedTextLength();
          var yPos = parseInt(parentNode.attr('y'), 10) + 4;
          var path = textStart +','+yPos;
          path = path+ ' '+textEnd + ',' +yPos;
          return path;
        });
    });





    /* 4c. Render the lined-up Marey
     *************************************************************/
    resetScale(linedUpYScale);
    resetScale(linedUpXScale);
    resetScale(linedUpTimeScale);
    linedUpMareyXScaleRatioFromFullMarey = originalLinedUpMareyXScaleRatioFromFullMarey;
    var linedUpOuterWidth = Math.min($('.lined-up-marey-container .container').width(), maxLinedUpMareyChartWidth);
    var linedUpWidth = linedUpOuterWidth - linedUpMargin.left - linedUpMargin.right;
    linedUpOuterHeight = linedUpOuterWidth * 300 / 780;
    linedUpHeight = linedUpOuterHeight - linedUpMargin.top - linedUpMargin.bottom;
    linedUpDayScale.range([0, linedUpHeight]);
    linedUpYScale.range([0, linedUpHeight]);
    var linedUpSvg = d3.select('.lined-up-marey').appendOnce('svg', 'lined-up')
        .attr('width', linedUpOuterWidth)
        .attr('height', linedUpOuterHeight);
    var linedUp = linedUpSvg.appendOnce('g', 'g');
    var linedUpOverlay = linedUpSvg.appendOnce('g', 'overlay');
    linedUp.firstTime.attr('transform', 'translate(' + linedUpMargin.left + ',' + linedUpMargin.top + ')');
    linedUpOverlay.firstTime.attr('transform', 'translate(' + linedUpMargin.left + ',' + linedUpMargin.top + ')');
    linedUpXScale.range(linedUpMareyLineEndPositions.map(function (d) { return d * linedUpWidth; }));
    var linedUpXPlacementScale = d3.scale.ordinal()
        .domain(linedUpMareyStartingStations)
        .range(linedUpMareyMidpointLabelPositions.map(function (d) { return d * linedUpWidth; }));
    linedUpYScale.range([0, linedUpHeight]);
    linedUpTimeScale.range([0, linedUpHeight]);

    var linedUpDayAxis = d3.svg.axis()
      .scale(linedUpDayScale)
      .tickFormat(d3.time.format.utc("%-I %p"))
      .orient('left')
      .ticks(d3.time.hour, 2);

    var brushAxis = linedUp.appendOnce('g', 'time axis')
      .attr('transform', 'translate(-40,0)')
      .call(linedUpDayAxis);

    brushAxis.on('mousemove.brush', function () {
      var y = d3.mouse(brushAxis.node())[1];
      var time = linedUpDayScale.invert(y);
      brush.extent([time.getTime() - 60 * 60 * 1000, time.getTime() + 60 * 60 * 1000]);
      d3.selectAll('g.brush').call(brush).on('mousedown.brush', null).on('touchstart.brush', null);
      brushed();
    });

    brushAxis.appendOnce("g", "brush").firstTime
        .call(brush)
        .call(brushed)
        .on('mousedown.brush', null).on('touchstart.brush', null)
      .selectAll("rect")
        .attr("x", -45)
        .attr("width", 50);


    var linedUpAxis = d3.svg.axis()
      .tickFormat(function (d) { return Math.round(d / 1000 / 60) + 'm'; })
      .innerTickSize(-linedUpWidth)
      .outerTickSize(0)
      .ticks(d3.time.minutes, 10)
      .scale(linedUpTimeScale)
      .orient("left");

    var axis = linedUp.appendOnce('g', 'y axis')
      .call(linedUpAxis);

    axis.appendOnce('text', 'label light-markup')
      .attr('transform', 'rotate(90)translate(' + (linedUpHeight/2) + ',-5)')
      .attr('text-anchor', 'middle')
      .text('minutes since start of trip');

    linedUp.appendOnce('text', 'top-label light-markup')
      .text('Starting Station')
      .attr('text-anchor', 'middle')
      .attr('x', linedUpWidth /2)
      .attr('y', -24);
    linedUp.appendOnce('text', 'bottom-label light-markup')
      .text('Ending Station')
      .attr('text-anchor', 'middle')
      .attr('x', linedUpWidth /2)
      .attr('y', linedUpHeight + 30);
    var stationHeaders = linedUp.selectAll('.station-header')
        .data(linedUpMareyStartingStations.filter(function (d) { return linedUpMareyStartingStationLabels[d].text; }));
    stationHeaders
        .enter()
      .append('g')
        .attr('class', 'station-header')
      .append('text')
        .attr('text-anchor', function (d) {
          return linedUpMareyStartingStationLabels[d].anchor;
        })
        .attr('dx', function (d) {
          return linedUpMareyStartingStationLabels[d].anchor === 'start' ? -4 : 4;
        })
        .attr('dy', -2)
        .text(function (d) {
          return linedUpMareyStartingStationLabels[d].text;
        });
    function placeStationHeader(selection) {
      selection
          .attr('transform', function (d) {
            return 'translate(' + linedUpXScale(d) + ',-10)';
          });
    }
    stationHeaders.call(placeStationHeader);

    var linedUpMareyContainer = linedUp.appendOnce('g', 'mareylinecontainer');
    linedUpMareyContainer.firstTime.attr('clip-path', 'url(#mareyClip)');
    linedUp
      .appendOnce('defs', 'defs')
      .appendOnce('clipPath', 'clip')
        .attr('id', 'mareyClip')
      .appendOnce('rect', 'clipRect')
        .attr('width', linedUpWidth)
        .attr('height', linedUpHeight);

    var linedUpMareyLines = linedUpMareyContainer.selectAll('.mareyline')
        .data(linedUpTrips, function (d) { return d.trip; });

    var t = null;
    if (!VIZ.ios) {
      linedUp
          .off('mouseover mouseout')
          .onOnce('mouseover', 'path', function (d) {
            clearTimeout(t);
            highlightLinedUpMarey(d);
            d3.select(this).moveToFront();
          })
          .onOnce('mouseout', 'path', function () {
            clearTimeout(t);
            t = setTimeout(unhighlightLinedUpMarey, 100);
          });
    }

    linedUpMareyLines
        .enter()
      .append('path')
        .attr('class', function (d) { return 'mareyline ' + d.line; });
    linedUpMareyLines.call(drawLinedUpLines);


    function modifiedXScale(d) {
      return linedUpMareyXScaleRatioFromFullMarey * xScale(d) * linedUpWidth / fullMareyWidth;
    }

    // use the same utility that draws the marey lines in the full marey diagram to 
    // render them in the lined-up marey diagram
    function drawLinedUpLines(lines) {
      lines
          .attr('transform', function (d) {
            var firstX = linedUpXScale(d.stops[0].stop);
            return 'translate(' + firstX + ',0)';
          })
          .attr('d', draw(modifiedXScale, linedUpYScale, true));
    }
    // Draw additional details when user hovers over a lined-up Marey line
    function highlightLinedUpMarey(d) {
      if (frozen) { return; }
      unhighlightLinedUpMarey();
      highlightedLinedUpMarey = d;
      linedUp.appendOnce('text', 'mareyannotation');
      var last = d.stops[d.stops.length - 1];
      var first = d.stops[0];
      var xEnd = linedUpXPlacementScale(first.stop);
      var xBegin = linedUpXScale(first.stop);
      var y = linedUpYScale((last.time - first.time));
      linedUp.appendOnce('text', 'mareyannotation start')
        .attr('x', xBegin + (linedUpMareyStartingStationLabels[first.stop].anchor === 'start' ?  5 : -5))
        .attr('y', -2)
        .style('text-anchor', linedUpMareyStartingStationLabels[first.stop].anchor)
        .text(moment(first.time * 1000).zone(5).format('h:mma'));
      linedUp.appendOnce('text', 'mareyannotation clickme')
        .attr('x', xEnd)
        .attr('y', 16)
        .style('text-anchor', 'middle')
        .classed('light-markup', true)
        .text('Click for details');
      linedUp.appendOnce('text', 'mareyannotation end')
        .attr('x', xEnd)
        .attr('y', y + 15)
        .style('text-anchor', 'middle')
        .text(moment(last.time * 1000).zone(5).format('h:mma'));
      linedUp.appendOnce('text', 'mareyannotation time')
        .attr('x', xEnd)
        .attr('y', y + 30)
        .style('text-anchor', 'middle')
        .text(Math.round((last.time - first.time) / 60) + 'm');
      linedUpOverlay.selectAll('g.mareystops')
          .data([d])
          .enter()
        .append('g')
          .attr('class', 'mareystops')
          .call(drawStops, modifiedXScale, linedUpYScale);
      linedUpOverlay.selectAll('g.mareynames')
          .data([d])
          .enter()
        .append('g')
          .attr('class', 'mareynames');

      linedUp.selectAll('.mareyline').classed({
        highlight: function (other) { return other === d; },
        dimmed: function (other) { return other !== d; }
      });
    }
    function unhighlightLinedUpMarey() {
      if (!highlightedLinedUpMarey || frozen) { return; }
      highlightedLinedUpMarey = null;
      linedUp.selectAll('.mareyannotation').remove();
      linedUpOverlay.selectAll('*').remove();
      linedUp.selectAll('.mareyline').classed({
        highlight: false,
        dimmed: false
      });
    }

    /* 4d. Set up listener to zoom in on a particular trip of the lined-up marey when user clicks on it
     *************************************************************/
    var TRANSITION_DURATION = 1000;
    if (!VIZ.ios) {
      d3.selectAll('.lined-up-marey')
          .on('click.toggle', function () { freezeHighlightedMarey(null, !frozen); });
    }
    // initialize to not frozen
    freezeHighlightedMarey(highlightedLinedUpMarey, frozen, true);

    function freezeHighlightedMarey(d, freeze, now) {
      var duration = now ? 0 : TRANSITION_DURATION;
      highlightedLinedUpMarey = highlightedLinedUpMarey || d;
      resetScale(linedUpTimeScale);
      resetScale(linedUpYScale);
      resetScale(linedUpXScale);
      linedUpMareyXScaleRatioFromFullMarey = originalLinedUpMareyXScaleRatioFromFullMarey;
      frozen = freeze;
      if (highlightedLinedUpMarey && frozen) {
        // transition all of the pieces to zoom in on just the one trip
        // also add labels and times for each stop along the trip
        var max = 1.1*(highlightedLinedUpMarey.end - highlightedLinedUpMarey.begin);
        tempSetDomain(linedUpTimeScale, [0, max * 1000]);
        var ratio = max / linedUpYScale.domain()[1];
        tempSetDomain(linedUpYScale, [0, max]);
        var start = highlightedLinedUpMarey.stops[0];
        var end = highlightedLinedUpMarey.stops[highlightedLinedUpMarey.stops.length - 1];

        var startX = linedUpXScale(start.stop);
        var endX = startX + xScale(header[end.stop + '|' + highlightedLinedUpMarey.line][0]) - xScale(header[start.stop + '|' + highlightedLinedUpMarey.line][0]);

        var dir = linedUpMareyStartingStationLabels[start.stop].anchor;
        var conversionScale = d3.scale.linear()
            .domain([startX, endX])
            .range(dir === 'start' ? [50, linedUpWidth - 50] : [linedUpWidth - 50, 50]);
        tempSetRange(linedUpXScale, linedUpXScale.range().map(conversionScale));
        linedUpMareyXScaleRatioFromFullMarey = originalLinedUpMareyXScaleRatioFromFullMarey * 1.5 / ratio;
        linedUp.selectAll('.mareyannotation').remove();
        (now ? stationHeaders : stationHeaders.transition().duration(duration))
          .call(placeStationHeader)
          .style('opacity', 0);
      } else {
        (now ? stationHeaders : stationHeaders.transition().duration(duration))
          .call(placeStationHeader)
          .style('opacity', 1);
      }
      linedUpOverlay.selectAll('.mareynames').call(drawLabels, modifiedXScale, linedUpYScale);
      axis.transition().duration(duration).call(linedUpAxis);
      linedUpOverlay.selectAll('g.mareystops').call(drawStops, modifiedXScale, linedUpYScale, !now);
      (now ? linedUpMareyLines : linedUpMareyLines.transition().duration(duration)).call(drawLinedUpLines);
      unhighlightLinedUpMarey();
    }
    // draw the time and station name labels on a selected trip
    function drawLabels(selection, xScale, yScale) {
      var items = selection
          .selectAll('.text')
          .data(function (d) {
            var startX = xScale(header[d.stops[0].stop + '|' + d.line][0]);
            var result = d.stops.map(function (stop) {
              if (!stop) { return null; }
              var y = yScale(stop.time) - yScale(d.stops[0].time);
              var x = xScale(header[stop.stop + '|' + d.line][0]) - startX;
              return {stop: stop, x: x, y: y, dytop: -1, dybottom: 9};
            });

            // prevent labels from overlapping eachother, iteratively push up/down until no overlap
            var last = -10;
            _.sortBy(result, 'y').forEach(function (d) {
              last += 9;
              if (last > d.y + d.dybottom) {
                d.dybottom = last - d.y;
              }
              last = d.y + d.dybottom;
            });
            last = 1000;
            _.sortBy(result, 'y').reverse().forEach(function (d) {
              last -= 9;
              if (last < d.y + d.dytop) {
                d.dytop = last - d.y;
              }
              last = d.y + d.dytop;
            });
            return result;
          }, function (d, i) { return i; });
      var labels = items.enter().append('g')
          .attr('class', 'text');
      labels.append('text')
          .attr('dx', function () { return linedUpMareyStartingStationLabels[highlightedLinedUpMarey.stops[0].stop].anchor === 'start' ? 2 : -2; })
          .attr('dy', function (d) { return d.dytop; })
          .text(function (d) {
            return VIZ.fixStationName(idToNode[d.stop.stop].name);
          })
          .attr('text-anchor', function () { return linedUpMareyStartingStationLabels[highlightedLinedUpMarey.stops[0].stop].anchor; });
      labels.append('text')
          .attr('dx', function () { return linedUpMareyStartingStationLabels[highlightedLinedUpMarey.stops[0].stop].anchor === 'start' ? -2 : 2; })
          .attr('dy', function (d) { return d.dybottom; })
          .text(function (d) {
            return moment(d.stop.time * 1000).zone(5).format('h:mma');
          })
          .attr('text-anchor', function () { return linedUpMareyStartingStationLabels[highlightedLinedUpMarey.stops[0].stop].anchor === 'start' ? 'end' : 'start'; });

      items
          .attr('transform', function (d) {
            var stop0 = highlightedLinedUpMarey.stops[0].stop;
            var firstX = linedUpXScale(stop0);
            return 'translate(' + (d.x + firstX) + ',' + d.y + ')';
          })
          .style('opacity', 0);

      items.transition().delay(TRANSITION_DURATION - 300).duration(300)
        .style('opacity', 1);
    }
    // place a dot for each stop on the line
    function drawStops(selection, xScale, yScale, trans) {
      var items = selection
          .selectAll('.point')
          .data(function (d) {
            var result = getPointsFromStop(xScale, yScale, d, true).filter(function (stop) { return !!stop; });
            var offset = linedUpXScale(d.stops[0].stop);
            result.forEach(function (stop) { stop.offset = offset; });
            return result;
          }, function (d, i) { return i; });
      items.enter()
        .append('circle')
          .attr('r', 2)
          .attr('class', 'point');

      (trans ? items.transition().duration(TRANSITION_DURATION) : items)
          .attr('cx', function (d) { return d.offset + d[0]; })
          .attr('cy', function (d) { return d[1]; });
    }
  }

  /* 5. Add interaction behavior with surrounding text
   *************************************************************/
  // Setup the links in text that scroll to a position in the marey diagram
  // <a href="#" data-dest="id of dist dom element to scroll to" class="scrollto">...
  fixedLeft.selectAll('.scrollto')
    .on('click', function () {
      var id = d3.select(this).attr('data-dest');
      var $element = $("#" + id);
      $('body, html').animate({scrollTop:$element.position().top}, '300', 'swing');
      d3.event.preventDefault();
    });

  // Setup the links in text that highlight a particular line
  // <a href="#" data-line="color of line to highlight" class="highlight">...
  fixedLeft.selectAll('.highlight')
    .on('click', function () {
      d3.event.preventDefault();
    })
    .on('mouseover', function () {
      var line = d3.select(this).attr('data-line');
      var others = _.without(['red', 'orange', 'blue'], line);
      others.forEach(function (other) {
        mareyContainer.selectAll('.' + other + ', .' + other + '-dimmable, circle.middle').classed('line-dimmed', true);
      });
    })
    .on('mouseout', function () {
      mareyContainer.selectAll('.line-dimmed').classed('line-dimmed', false);
    });

  // Setup the links in text that highlight part of the Marey diagram
  // <a href="#" data-lo="start hour of day" data-hi="end hour of day" class="lined-up-highlight">...
  d3.selectAll('.lined-up-highlight')
    .on('click', function () {
      d3.event.preventDefault();
    })
    .on('mouseover', function () {
      var lo = +d3.select(this).attr('data-lo');
      var hi = +d3.select(this).attr('data-hi');
      brush.extent([lo * 60 * 60 * 1000, hi * 60 * 60 * 1000]);
      d3.selectAll('g.brush').call(brush).on('mousedown.brush', null).on('touchstart.brush', null);
      brushed();
    });


  /* Miscellaneous Utilities
   *************************************************************/
  function highlight() {
    mareyContainer.classed('highlight-active', !!highlightedTrip);
    mareyContainer.selectAll('.highlightable')
      .classed('active', function (d) { return d.trip === highlightedTrip; });
  }
  function highlightTrain(d) {
    if (d === null) {
      highlightedTrip = null;
    } else {
      highlightedTrip = d.trip;
    }
    highlight();
    d3.event.stopPropagation();
  }
  function unHoverTrain() {
    hoveredTrip = null;
    hover();
  }
  function hoverTrain(d) {
    hoveredTrip = d.trip;
    hover();
  }
  function brushed() {
    var lo = brush.extent()[0] / 1000;
    var hi = brush.extent()[1] / 1000;
    d3.selectAll('.lined-up .mareyline')
        .style('opacity', function (d) {
          return lo < d.secs && hi > d.secs ? 0.7 : 0.1;
        });
  }
  function hover() {
    d3.selectAll('.hoverable')
      .classed('hover', function (d) { return d.trip === hoveredTrip; });
  }
  function highlightMareyTitle(title, lines) {
    var titles = {};
    titles[title] = true;
    if (lines) {
      lines.forEach(function (line) { titles[title + "|" + line] = true; });
    } else if (title) {
      titles[title] = true;
      titles[title.replace(/\|.*/, '')] = true;
    }
    var stationLabels = marey.selectAll('text.station-label');
    stationLabels.style('display', function (d) {
      var display = end[d] || titles[d];
      return display ? null : 'none';
    });
    stationLabels.classed('active', function (d) {
      return titles[d.id ? d.id : d];
    });
  }

  function placeWithOffset(from, to, ratio) {
    var fromPos = idToNode[from.stop].pos;
    var toPos = idToNode[to.stop].pos;
    var midpoint = d3.interpolate(fromPos, toPos)(ratio);
    var angle = Math.atan2(toPos[1] - fromPos[1], toPos[0] - fromPos[0]) + Math.PI / 2;
    return [midpoint[0] + Math.cos(angle) * mapGlyphTrainCircleRadius, midpoint[1] + Math.sin(angle) * mapGlyphTrainCircleRadius ];
  }
  function tempSetDomain(scale, domain) {
    scale.oldDomain = scale.oldDomain || scale.domain();
    scale.domain(domain);
  }
  function tempSetRange(scale, range) {
    scale.oldRange = scale.oldRange || scale.range();
    scale.range(range);
  }

  function resetScale(scale) {
    if (scale.oldDomain) { scale.domain(scale.oldDomain); }
    if (scale.oldRange) { scale.range(scale.oldRange); }
    scale.oldDomain = null;
    scale.oldRange = null;
  }
});

