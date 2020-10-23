// Visualization Methods

function initInteractiveMarkovChainVisualization(domID, interactiveMarkovChainData, interactiveMarkovChainLabels) {
  
  $('#'+ domID).empty();
  $('#'+ domID).append('<svg></svg>');

  var visualizationOptions = $('<div class="visualizationOptionsContainer">'
                              +'  <div class="form-check form-check-inline">'
                              +'    <input class="form-check-input" type="checkbox" id="simulationCheckbox'+ domID +'" value="simulationCheckbox">'
                              +'    <label class="form-check-label" for="simulationCheckbox'+ domID +'">Simulation</label>'
                              +'  </div>'
                              +'  <div class="form-check form-check-inline">'
                              +'    <input class="form-check-input" type="checkbox" id="valuesCheckbox'+ domID +'" value="valuesCheckbox">'
                              +'    <label class="form-check-label" for="valuesCheckbox'+ domID +'">Values</label>'
                              +'  </div>'
                              +'</div>');
  visualizationOptions.find('input[type="checkbox"]').on('change', function(evt) {
    var isChecked = evt.currentTarget.checked.toString(),
        optionID = $(evt.currentTarget).attr('value');

    $(evt.currentTarget).parents('.markovChainVisualization').attr('data-'+ optionID, isChecked);
  });
  $('#'+ domID).append(visualizationOptions);

  var diagramCenter = [0.5, 0.5],
      transitionMatrixDuration = 2000,
      transitionMatrix,
      transitionMatrixStates,
      selectedTransition;

  function updateTransitionMatrix(matrix) {
      var prev = transitionMatrix;
      transitionMatrix = matrix;
      if(!transitionMatrixStates || matrix.length !== prev.length) {
        transitionMatrixStates = matrix.map(function(d, i) {
          if(interactiveMarkovChainLabels && i < Object.keys(interactiveMarkovChainLabels).length){
            return { label: interactiveMarkovChainLabels[i], index: i };
          } else {
            return { label: String.fromCharCode(65 + i), index: i};
          }
        });
      }
    }

  updateTransitionMatrix(interactiveMarkovChainData);

  var el = d3.select('#' + domID);
  calcResize();
  var svg = el.select('svg');
  var alignG = svg.append('g');
  var centerG = alignG.append('g');
  var links = centerG.append('g').attr('class', 'links').selectAll('g');
  var nodes = centerG.append('g').attr('class', 'nodes').selectAll('g');
  var markers = svg.append('defs').selectAll('.linkMarker');
  var currentStateG = centerG.append('g').attr('class', 'currentState')
  .attr('transform', 'translate(' + [w / 2, h / 2] + ')')
  .style('opacity', 0);
  var w, h, r = 16;
  var linkElements = {};
  var force = d3.layout.force()
  .linkDistance(function(d){ return w / 4 + (1 - d.value) * 200 * w / 1600 })
  .friction(0.2)
  .charge(-4000);

  // State Indicator
  currentStateG.append('circle').attr('r', 8);

  function calcResize() {
    return w = el.node().clientWidth, h = el.node().clientHeight, w + h;
  }
  $(window).resize(function() {
    calcResize();
    resize();
    update();
  });
  resize();
  update();

  function resize() {
    force.size([w, h]);
    svg.attr({width: w, height: h});
    var center = center;
    var cx = (center && angular.isDefined(center[0])) ? center[0] : 0.5;
    var cy = (center && angular.isDefined(center[1])) ? center[1] : 0.5;
    alignG.attr('transform', 'translate(' + [ w * cx, h * cy ] + ')');
    centerG.attr('transform', 'translate(' + [ - w / 2, - h / 2] + ')');
  }

  function update() {
    var linksData = [];
    var enter;
    transitionMatrix.forEach(function(transitions, idx1) {
      // idx1 - the index of the currently state
      // transitions - an array of the next state probabilities were
      // each index in the array coorisponds to a state in `transitionMatrixStates`.
      transitions.forEach(function(prob, idx2) {
        if(prob === 0) return;
        linksData.push({
          source: transitionMatrixStates[idx1],
          target: transitionMatrixStates[idx2],
          value: +prob
        });
      });
    });
    nodes = nodes.data(transitionMatrixStates);
    enter = nodes.enter().append('g')
    .attr('class', 'node')
    .style('fill', function(d){ return getColorForSequenceNumber(d.label); })
    .call(force.drag);
    enter.append('circle')
    .attr('r', r);
    enter.append('text')
    .attr('transform', 'translate(' + [0, 5] + ')')
    nodes.exit().remove();

    var linkKey = function(d) {
      return (d.source && d.source.index) + ':'
      + (d.target && d.target.index);
    };

    links = links.data(linksData, linkKey);
    var linkG = links
    .enter()
    .append('g');
    linkG.append('path')
    .attr('marker-end', function(d) {
      if(!d.source || !d.target) debugger;
      return 'url(#'+ domID +'-linkMarker-' + d.source.index + '-' + d.target.index + ')';
    }).classed('link', true)
    .attr('id', function(d, i) { return domID +'_path_' + i; })
    .style('stroke', function(d){ return getColorForSequenceNumber(d.source.label); });
    linkG.append('text')
    .append('textPath')
    .attr('xlink:href', function(d, i) { return '#'+ domID +'_path_' + i; })
    .style('text-anchor', 'middle')
    .attr('startOffset', '50%')
    .text(function(d, i) { return d.value });
    links.exit().remove();

    // State Indicator
    links.selectAll('path').each(function(d, i) {
      linkElements[d.source.index + ':' +d.target.index] = this;
      var active = false, inactive = false;
      if (selectedTransition) {
        active = selectedTransition[0] === d.source.index
        && selectedTransition[1] === d.target.index;
        inactive = !active;
      }
      d3.select(this)
      .classed('active', active)
      .classed('inactive', inactive);
    });

    // Arrow Pointer
    markers = markers.data(linksData, linkKey);
    markers.enter().append('marker')
    .attr('class', 'linkMarker')
    .attr('id', function(d) {
      return domID +'-linkMarker-' + d.source.index + '-' + d.target.index })
    .attr('orient', 'auto')
    .attr({markerWidth: 2, markerHeight: 4})
    .attr({refX: 0, refY: 2})
    .append('path')
    .attr('d', 'M0,0 V4 L2,2 Z')
    .style('fill', function(d){ return getColorForSequenceNumber(d.source.label); });
    markers.exit().remove();

    force.nodes(transitionMatrixStates)
    .links(linksData)
    .start();
  }

  force.on('tick', function() {
    var _r = r;
    links.selectAll('path')
    .style('stroke-width', function(d) {
      return Math.sqrt(100 * d.value || 2); })
    .attr('d', function(d) {
      var r = _r;
      var p1 = vector(d.source.x, d.source.y);
      var p2 = vector(d.target.x, d.target.y);
      var dir = p2.sub(p1);
      var u = dir.unit();
      if(d.source !== d.target) {
        r *= 2;
        var right = dir.rot(Math.PI /2).unit().scale(50);
        var m = p1.add(u.scale(dir.len() / 2)).add(right);
        u = p2.sub(m);
        l = u.len();
        u = u.unit();
        p2 = m.add(u.scale(l - r));
        u = p1.sub(m);
        l = u.len();
        u = u.unit();
        p1 = m.add(u.scale(l - r));
        return 'M' + p1.array() + 'S' + m.array() + ' ' + p2.array();
      }else{
        var s = 50, rot = Math.PI / 8;
        r = r * 1.5;
        p1 = p1.add(vector(1, -1).unit().scale(r - 10))
        p2 = p2.add(vector(1, 1).unit().scale(r))
        var c1 = p1.add(vector(1, 0).rot(-rot).unit().scale(s));
        var c2 = p2.add(vector(1, 0).rot(rot).unit().scale(s - 10));
        return 'M' + p1.array() + ' C' + c1.array() + ' '
        + c2.array() + ' ' + p2.array();
      }
    });
    nodes.attr('transform', function(d) {
      return 'translate(' + [d.x, d.y] + ')';
    }).select('text').text(function(d){ return d.label; });

  });

  var currentState = 0;
  function loop() {
    var i = currentState;
    var nextStates = transitionMatrix[i];
    var nextState = -1;
    var rand = Math.random();
    var total = 0;
    for(var j = 0; j < nextStates.length; j++) {
      total += nextStates[j];
      if(rand < total) {
        nextState = j;
        break;
      }
    }
    if (typeof transitionMatrixStates[nextState] == 'undefined') {
      return;
    }

    var cur = transitionMatrixStates[currentState];
    var next = transitionMatrixStates[nextState];
    var path = linkElements[cur.index + ':' + next.index];
    
    currentStateG
    .transition().duration(+transitionMatrixDuration * 0.25)
    .style('opacity', 1)
    .ease('cubic-in')
    .attrTween('transform', function() {
      var m = d3.transform(d3.select(this).attr('transform'));
      var start = vector.apply(null, m.translate);
      var scale = m.scale;
      var s = d3.interpolateArray(scale, [1, 1]);
      return function(t) {
        var end = path.getPointAtLength(0);
        end = vector(end.x, end.y);
        var p = start.add(end.sub(start).scale(t));
        return 'translate(' + p.array() + ') scale(' + s(t) + ')';
      };
    })
    .transition().duration(transitionMatrixDuration * 0.5)
    .ease('linear')
    .attrTween('transform', function() {
      var l = path.getTotalLength();
      return function(t) {
        var p = path.getPointAtLength(t * l);
        return 'translate(' + [p.x, p.y] + ') scale(1)';
      };
    })
    .transition().duration(transitionMatrixDuration * 0.25)
    .ease('linear')
    .attrTween('transform', function() {
      var m = d3.transform(d3.select(this).attr('transform'));
      var translation = vector.apply(null, m.translate);
      var scale = m.scale;
      var s = d3.interpolateArray(scale, [2, 2]);
      return function(t) {
        var end = vector(next.x, next.y);
        var p = translation.add(end.sub(translation).scale(t));
        return 'translate(' + p.array() + ') scale(' + s(t) + ')';
      };
    })
    .each('end', function() {
      loop();
    })
    currentState = nextState;
  }
  setTimeout(loop, transitionMatrixDuration);
}

function vector(x, y) {
  var v = {x: x, y: y}
  // All methods return a new vector object.
  v.rot = function(theta) {
    var x = v.x * Math.cos(theta) - v.y * Math.sin(theta);
    var y = v.x * Math.sin(theta) + v.y * Math.cos(theta);
    return vector(x, y);
  }
  v.unit = function() { var l = v.len(); return vector(v.x / l, v.y / l) };
  v.len = function() { return Math.sqrt( v.x * v.x + v.y * v.y ) };
  v.sub = function(b) { return vector(v.x - b.x, v.y - b.y) };
  v.add = function(b) { return vector(v.x + b.x, v.y + b.y) };
  v.scale = function(s) { return vector(v.x * s, v.y * s) };
  v.rotDegrees = function(theta) { return v.rot(theta * Math.PI / 180) };
  v.array = function() { return [v.x, v.y] };
  return v;
}