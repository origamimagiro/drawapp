// Generated by CoffeeScript 1.10.0
(function() {
  var CURSORS, KEYMAP, SVGNS, createElement, createSVG, deactivate, deleteSelection, deselect, getBBox, getId, hasAttrs, makeCycle, makePath, mouseToSVG, setAttrs, state, updateViewBox;

  SVGNS = 'http://www.w3.org/2000/svg';

  getId = function(id) {
    return document.getElementById(id);
  };

  setAttrs = function(el, attrs) {
    var k, v;
    if (attrs == null) {
      attrs = {};
    }
    for (k in attrs) {
      v = attrs[k];
      el.setAttribute(k, v);
    }
    return el;
  };

  hasAttrs = function(el, attrs) {
    return attrs.every(function(a) {
      return el.hasAttribute(a);
    });
  };

  createElement = function(tag, attrs) {
    return setAttrs(document.createElement(tag), attrs);
  };

  createSVG = function(tag, attrs) {
    return setAttrs(document.createElementNS(SVGNS, tag), attrs);
  };

  makePath = function(coords) {
    var c, i;
    return ((function() {
      var j, len, results;
      results = [];
      for (i = j = 0, len = coords.length; j < len; i = ++j) {
        c = coords[i];
        results.push((i === 0 ? 'M' : 'L') + " " + c[0] + " " + c[1] + " ");
      }
      return results;
    })()).reduce(function(a, b) {
      return a + b;
    });
  };

  makeCycle = function(coords) {
    return makePath(coords) + 'Z';
  };

  KEYMAP = {
    8: 'delete',
    16: 'shift',
    27: 'esc',
    32: 'pan',
    79: 'ellipse',
    80: 'pen',
    86: 'select'
  };

  CURSORS = {
    pen: 'crosshair',
    select: 'default',
    ellipse: 'crosshair',
    pan: 'move'
  };

  state = {
    scale: 1,
    mode: 'select',
    dragging: false,
    spacePressed: false,
    shiftPressed: false,
    mouseLast: null,
    viewBox: null,
    active: null,
    selection: []
  };

  updateViewBox = function(el, v) {
    return setAttrs(el, {
      viewBox: v.x + " " + v.y + " " + v.width + " " + v.height
    });
  };

  getBBox = function(el) {
    var a, attrs, bbox, j, len;
    attrs = ['x', 'y', 'width', 'height'];
    bbox = {};
    if (hasAttrs(el, attrs)) {
      for (j = 0, len = attrs.length; j < len; j++) {
        a = attrs[j];
        bbox[a] = el.getAttribute[a];
      }
    }
    return bbox;
  };

  mouseToSVG = function(p, state) {
    return {
      x: p.x * state.scale + state.viewBox.x,
      y: p.y * state.scale + state.viewBox.y
    };
  };

  window.onload = function() {
    var svg;
    svg = createSVG('svg', {
      id: 'top',
      width: '100%',
      height: '100%',
      xmlns: SVGNS
    });
    svg.appendChild(createSVG('style', {
      id: 'appStyles'
    })).innerHTML = 'circle:hover { stroke: #F00; } #interface > circle { stroke: #00F }';
    svg.appendChild(createSVG('style', {
      id: 'graphicStyles'
    }));
    svg.appendChild(createSVG('g', {
      id: 'artBoards'
    })).appendChild(createSVG('rect', {
      x: 0,
      y: 0,
      width: '800',
      height: '600',
      stroke: 'none',
      fill: '#FFF'
    }));
    svg.appendChild(createSVG('g', {
      id: 'layer1'
    }));
    svg.appendChild(createSVG('g', {
      id: 'interface'
    }));
    getId('body').appendChild(svg);
    state.viewBox = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
    return updateViewBox(svg, state.viewBox);
  };

  deactivate = function() {
    var ref;
    if (((ref = state.active) != null ? ref.node : void 0) != null) {
      state.active.node.remove();
      return state.active = null;
    }
  };

  deselect = function() {
    var j, len, ref, s;
    deactivate();
    if (state.selection.length > 0) {
      ref = state.selection;
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        s.image.remove();
        s.target.classList.remove('selected');
      }
      return state.selection = [];
    }
  };

  deleteSelection = function() {
    var selected;
    selected = document.getElementsByClassName('selected');
    while (selected.length > 0) {
      selected.item(0).remove();
    }
    return deselect();
  };

  document.addEventListener('keydown', function(e) {
    var key;
    key = KEYMAP[e.keyCode];
    switch (key) {
      case 'esc':
        deselect();
        break;
      case 'delete':
        deleteSelection();
        break;
      case 'shift':
        state.shiftPressed = true;
        break;
      case 'pan':
        getId('body').style.cursor = CURSORS.pan;
        state.spacePressed = true;
        break;
      case 'pen':
      case 'ellipse':
      case 'select':
        if (key === state.mode) {
          break;
        }
        deactivate();
        state.mode = key;
        getId('body').style.cursor = CURSORS[state.mode];
        break;
    }
  });

  document.addEventListener('keyup', function(e) {
    var key;
    key = KEYMAP[e.keyCode];
    switch (key) {
      case 'shift':
        return state.shiftPressed = false;
      case 'pan':
        state.spacePressed = false;
        return getId('body').style.cursor = CURSORS[state.mode];
    }
  });

  document.addEventListener('mousedown', function(e) {
    var c, i, j, len, ref, s;
    state.mouseLast = mouseToSVG(e, state);
    if (state.mode === 'ellipse') {
      if (state.active === null) {
        deselect();
        c = mouseToSVG(e, state);
        state.active = {
          cx: c.x,
          cy: c.y,
          r: 0
        };
        state.active.node = setAttrs(createSVG('circle', state.active), {
          stroke: '#000',
          fill: 'none',
          'stroke-width': 2
        });
        getId('layer1').appendChild(state.active.node);
      } else {
        state.active = null;
      }
    }
    if (state.mode === 'select') {
      switch (e.target.nodeName) {
        case 'circle':
        case 'rect':
        case 'path':
          if (getId('layer1').contains(e.target)) {
            if (!state.shiftPressed) {
              deselect();
            }
            state.selection.push({
              target: e.target,
              image: getId('interface').appendChild(e.target.cloneNode())
            });
            e.target.classList.add('selected');
            state.dragging = true;
          }
          if (getId('interface').contains(e.target) && state.shiftPressed) {
            ref = state.selection;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              s = ref[i];
              if (s.image.contains(e.target)) {
                s.target.classList.remove('selected');
                s.image.remove();
                state.selection.splice(i, 1);
                break;
              }
            }
          }
          if (getId('interface').contains(e.target)) {
            state.dragging = true;
          }
      }
      if (getId('artBoards').contains(e.target)) {
        return deselect();
      }
    }
  });

  document.addEventListener('mousemove', function(e) {
    var c, j, len, p, r, ref, s, x, y;
    if (state.spacePressed && (state.mouseLast !== null)) {
      state.viewBox = {
        x: state.mouseLast.x - e.x * state.scale,
        y: state.mouseLast.y - e.y * state.scale,
        width: window.innerWidth * state.scale,
        height: window.innerHeight * state.scale
      };
      updateViewBox(getId('top'), state.viewBox);
    }
    if ((state.mode === 'ellipse') && (state.active !== null)) {
      c = mouseToSVG(e, state);
      r = Math.sqrt((state.active.cx - c.x) * (state.active.cx - c.x) + (state.active.cy - c.y) * (state.active.cy - c.y));
      setAttrs(state.active.node, {
        r: r
      });
    }
    if ((state.mode === 'select') && state.dragging) {
      p = mouseToSVG(e, state);
      ref = state.selection;
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        x = parseFloat(s.target.getAttribute('cx'));
        y = parseFloat(s.target.getAttribute('cy'));
        s.target.setAttribute('cx', x + p.x - state.mouseLast.x);
        s.target.setAttribute('cy', y + p.y - state.mouseLast.y);
        s.image.setAttribute('cx', x + p.x - state.mouseLast.x);
        s.image.setAttribute('cy', y + p.y - state.mouseLast.y);
      }
      return state.mouseLast = p;
    }
  });

  document.addEventListener('mouseup', function(e) {
    state.dragging = false;
    return state.mouseLast = null;
  });

  document.addEventListener('mouseout', function(e) {
    if (state.spacePressed && (e.relatedTarget === null) && (state.mouseLast !== null)) {
      return state.mouseLast = null;
    }
  });

  window.addEventListener('resize', function(e) {
    state.viewBox.width = window.innerWidth * state.scale;
    state.viewBox.height = window.innerHeight * state.scale;
    return updateViewBox(getId('top'), state.viewBox);
  });

  window.addEventListener('wheel', function(e) {
    var p;
    p = mouseToSVG(e, state);
    state.scale = state.scale * (1 + e.deltaY / 100);
    state.viewBox = {
      x: p.x - e.x * state.scale,
      y: p.y - e.y * state.scale,
      width: window.innerWidth * state.scale,
      height: window.innerHeight * state.scale
    };
    return updateViewBox(getId('top'), state.viewBox);
  });

}).call(this);
