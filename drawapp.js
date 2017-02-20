// Generated by CoffeeScript 1.10.0
(function() {
  var CURSORS, INTRO, KEYMAP, SVGNS, createElement, createSVG, deactivate, deleteSelection, deselect, getByClass, getByTag, getId, makeCycle, makePath, mouseToSVG, nodesToArray, setAttrs, state, updateViewBox;

  SVGNS = 'http://www.w3.org/2000/svg';

  nodesToArray = function(ns) {
    var i, j, ref, results;
    results = [];
    for (i = j = 0, ref = ns.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      results.push(ns.item(i));
    }
    return results;
  };

  getId = function(id) {
    return document.getElementById(id);
  };

  getByClass = function(cl) {
    return nodesToArray(document.getElementsByClassName(cl));
  };

  getByTag = function(tag) {
    return nodesToArray(document.getElementsByTagName(tag));
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

  INTRO = 'Draw circles!\n\n' + 'Pan by pressing space bar.\n' + 'Zoom by scrolling up and down.\n' + 'Press the "o" key to enter circle draw mode.\n' + 'Click to place a center, and click again to complete.\n' + 'Press the "v" key to enter select mode.\n' + 'Click on circles to select, or shift-click to toggle select.\n' + 'Move selected circles by dragging.\n' + 'Remove selected circles by pressing delete.';

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
    active: null
  };

  updateViewBox = function(el, v) {
    return setAttrs(el, {
      viewBox: v.x + " " + v.y + " " + v.width + " " + v.height
    });
  };

  mouseToSVG = function(p, scale, viewBox) {
    return {
      x: p.x * scale + viewBox.x,
      y: p.y * scale + viewBox.y
    };
  };

  deactivate = function() {
    var ref;
    if (((ref = state.active) != null ? ref.node : void 0) != null) {
      state.active.node.remove();
      state.active = null;
    }
  };

  deselect = function() {
    var j, len, ref, s;
    deactivate();
    ref = getByClass('selected');
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      s.classList.remove('selected');
    }
  };

  deleteSelection = function() {
    var j, len, ref, s;
    ref = getByClass('selected');
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      s.remove();
    }
    deselect();
  };

  window.onload = function() {
    var artboards, canvas, styles, svg;
    window.alert(INTRO);
    svg = createSVG('svg', {
      id: 'svg',
      width: '100%',
      height: '100%',
      xmlns: SVGNS
    });
    styles = createSVG('style', {
      id: 'appStyles'
    });
    styles.innerHTML = 'circle:hover { stroke: #F00; } .selected, .selected:hover { stroke: #00F;}';
    svg.appendChild(styles);
    artboards = createSVG('g', {
      id: 'artBoards'
    });
    artboards.appendChild(createSVG('rect', {
      x: 0,
      y: 0,
      width: '800',
      height: '600',
      stroke: 'none',
      fill: '#FFF'
    }));
    svg.appendChild(artboards);
    canvas = createSVG('g', {
      id: 'canvas'
    });
    svg.appendChild(canvas);
    getId('body').appendChild(svg);
    state.viewBox = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
    return updateViewBox(svg, state.viewBox);
  };

  document.addEventListener('keydown', function(e) {
    var key;
    key = KEYMAP[e.keyCode];
    if (key === 'delete') {
      deleteSelection();
    }
    if (key === 'shift') {
      state.shiftPressed = true;
    }
    if (key === 'pan') {
      getId('body').style.cursor = CURSORS.pan;
      state.spacePressed = true;
    }
    if (((key === 'select') || (key === 'ellipse')) && (key !== state.mode)) {
      deactivate();
      state.mode = key;
      getId('body').style.cursor = CURSORS[state.mode];
    }
    if (key === 'esc') {
      deselect();
      state.mode = 'select';
      state.mouseLast = null;
      return getId('body').style.cursor = CURSORS[state.mode];
    }
  });

  document.addEventListener('keyup', function(e) {
    var key;
    key = KEYMAP[e.keyCode];
    if (key === 'shift') {
      state.shiftPressed = false;
    }
    if (key === 'pan') {
      state.spacePressed = false;
      return getId('body').style.cursor = CURSORS[state.mode];
    }
  });

  document.addEventListener('mousedown', function(e) {
    var c, selected;
    state.mouseLast = mouseToSVG(e, state.scale, state.viewBox);
    if (state.mode === 'ellipse' && !state.spacePressed) {
      if (state.active === null) {
        deselect();
        c = mouseToSVG(e, state.scale, state.viewBox);
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
        getId('canvas').appendChild(state.active.node);
      } else {
        state.active = null;
      }
    }
    if (state.mode === 'select' && !state.spacePressed) {
      if (getId('canvas').contains(e.target)) {
        selected = e.target.classList.contains('selected');
        if (selected) {
          if (state.shiftPressed) {
            e.target.classList.remove('selected');
          }
        } else {
          if (!state.shiftPressed) {
            deselect();
          }
          e.target.classList.add('selected');
        }
        state.dragging = true;
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
      updateViewBox(getId('svg'), state.viewBox);
    }
    if ((state.mode === 'ellipse') && (state.active !== null)) {
      c = mouseToSVG(e, state.scale, state.viewBox);
      r = Math.sqrt((state.active.cx - c.x) * (state.active.cx - c.x) + (state.active.cy - c.y) * (state.active.cy - c.y));
      setAttrs(state.active.node, {
        r: r
      });
    }
    if ((state.mode === 'select') && state.dragging) {
      p = mouseToSVG(e, state.scale, state.viewBox);
      ref = getByClass('selected');
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        x = parseFloat(s.getAttribute('cx'));
        y = parseFloat(s.getAttribute('cy'));
        s.setAttribute('cx', x + p.x - state.mouseLast.x);
        s.setAttribute('cy', y + p.y - state.mouseLast.y);
      }
      return state.mouseLast = p;
    }
  });

  document.addEventListener('mouseup', function(e) {
    state.dragging = false;
    return state.mouseLast = null;
  });

  document.addEventListener('mouseout', function(e) {
    if (state.spacePressed && (e.relatedTarget === null)) {
      return state.mouseLast = null;
    }
  });

  window.addEventListener('resize', function(e) {
    state.viewBox.width = window.innerWidth * state.scale;
    state.viewBox.height = window.innerHeight * state.scale;
    return updateViewBox(getId('svg'), state.viewBox);
  });

  window.addEventListener('wheel', function(e) {
    var p;
    p = mouseToSVG(e, state.scale, state.viewBox);
    state.scale = state.scale * (1 + e.deltaY / 100);
    state.viewBox = {
      x: p.x - e.x * state.scale,
      y: p.y - e.y * state.scale,
      width: window.innerWidth * state.scale,
      height: window.innerHeight * state.scale
    };
    return updateViewBox(getId('svg'), state.viewBox);
  });

}).call(this);
