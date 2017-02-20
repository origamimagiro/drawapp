SVGNS = 'http://www.w3.org/2000/svg'
nodesToArray = (ns) -> (ns.item(i) for i in [0...ns.length])
getId = (id) -> document.getElementById(id)
getByClass = (cl) -> nodesToArray(document.getElementsByClassName(cl))
getByTag = (tag) -> nodesToArray(document.getElementsByTagName(tag))
setAttrs = (el, attrs = {}) -> (el.setAttribute(k, v) for k, v of attrs); el
createElement = (tag, attrs) -> setAttrs(document.createElement(tag), attrs)
createSVG = (tag, attrs) -> setAttrs(document.createElementNS(SVGNS, tag),attrs)
makePath = (coords) ->
  ("#{if (i is 0) then 'M' else 'L'} #{c[0]} #{c[1]} " for c, i in coords)
    .reduce((a,b) -> a + b)
makeCycle = (coords) -> makePath(coords) + 'Z'

INTRO =
  'Draw circles!\n\n' + 'Pan by pressing space bar.\n' +
  'Zoom by scrolling up and down.\n' +
  'Press the "o" key to enter circle draw mode.\n' +
  'Click to place a center, and click again to complete.\n' +
  'Press the "v" key to enter select mode.\n' +
  'Click on circles to select, or shift-click to toggle select.\n' +
  'Move selected circles by dragging.\n' +
  'Remove selected circles by pressing delete.'

KEYMAP = {
  8:  'delete'  # 'backspace'
  16: 'shift'   # 'shift'
  27: 'esc'     # 'escape'
  32: 'pan'     # 'space'
  79: 'ellipse' # 'o'
  86: 'select'  # 'v'
}

CURSORS = {
  select:  'default'
  ellipse: 'crosshair'
  pan:     'move'
}

state = {
  scale: 1
  mode: 'select'
  dragging: false
  spacePressed: false
  shiftPressed: false
  mouseLast: null
  viewBox: null
  active: null
}

updateViewBox = (el, v) ->
  setAttrs(el, {viewBox: "#{v.x} #{v.y} #{v.width} #{v.height}"})

mouseToSVG = (p, scale, viewBox) ->
  {x: p.x * scale + viewBox.x, y: p.y * scale + viewBox.y}

deactivate = () ->
  if state.active?.node?
    state.active.node.remove()
    state.active = null
  return

deselect = () ->
  deactivate()
  for s in getByClass('selected')
    s.classList.remove('selected')
  return

deleteSelection = () ->
  (s.remove() for s in getByClass('selected'))
  deselect()
  return

window.onload = () ->
  window.alert(INTRO)
  svg = createSVG('svg', {id:'svg', width:'100%', height:'100%', xmlns:SVGNS})
  styles = createSVG('style', {id: 'appStyles'})
  styles.innerHTML =
    'circle:hover { stroke: #F00; } .selected, .selected:hover { stroke: #00F;}'
  svg.appendChild(styles)
  artboards = createSVG('g', {id: 'artBoards'})
  artboards.appendChild(createSVG('rect', {
    x: 0, y: 0, width: '800', height: '600', stroke: 'none', fill: '#FFF'}))
  svg.appendChild(artboards)
  canvas = createSVG('g', {id: 'canvas'})
  svg.appendChild(canvas)
  getId('body').appendChild(svg)
  state.viewBox = {
    x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
  updateViewBox(svg, state.viewBox)

document.addEventListener('keydown', (e) ->
  key = KEYMAP[e.keyCode]
  if key is 'delete'
    deleteSelection()
  if key is 'shift'
    state.shiftPressed = true
  if key is 'pan'
    getId('body').style.cursor = CURSORS.pan
    state.spacePressed = true
  if ((key is 'select') or (key is 'ellipse')) and (key isnt state.mode)
    deactivate()
    state.mode = key
    getId('body').style.cursor = CURSORS[state.mode]
  if key is 'esc'
    deselect()
    state.mode = 'select'
    state.mouseLast = null
    getId('body').style.cursor = CURSORS[state.mode]
)

document.addEventListener('keyup', (e) ->
  key = KEYMAP[e.keyCode]
  if key is 'shift'
    state.shiftPressed = false
  if key is 'pan'
    state.spacePressed = false
    getId('body').style.cursor = CURSORS[state.mode]
)

document.addEventListener('mousedown', (e) ->
  state.mouseLast = mouseToSVG(e, state.scale, state.viewBox)
  if state.mode is 'ellipse' and not state.spacePressed
    if state.active is null
      deselect()
      c = mouseToSVG(e, state.scale, state.viewBox)
      state.active = {cx: c.x, cy: c.y, r: 0}
      state.active.node = setAttrs(createSVG('circle', state.active), {
        stroke: '#000', fill: 'none', 'stroke-width': 2 })
      getId('canvas').appendChild(state.active.node)
    else
      state.active = null
  if state.mode is 'select' and not state.spacePressed
    if getId('canvas').contains(e.target)
      selected = e.target.classList.contains('selected')
      if selected
        if state.shiftPressed
          e.target.classList.remove('selected')
      else
        if not state.shiftPressed
          deselect()
        e.target.classList.add('selected')
      state.dragging = true
    if getId('artBoards').contains(e.target)
      deselect()
)

document.addEventListener('mousemove', (e) ->
  if state.spacePressed and (state.mouseLast isnt null)
    state.viewBox = {
      x: state.mouseLast.x - e.x * state.scale
      y: state.mouseLast.y - e.y * state.scale
      width: window.innerWidth  * state.scale
      height: window.innerHeight * state.scale
    }
    updateViewBox(getId('svg'), state.viewBox)
  if (state.mode is 'ellipse') and (state.active isnt null)
    c = mouseToSVG(e, state.scale, state.viewBox)
    r = Math.sqrt(
      (state.active.cx - c.x) * (state.active.cx - c.x) +
      (state.active.cy - c.y) * (state.active.cy - c.y))
    setAttrs(state.active.node, {r: r})
  if (state.mode is 'select') and state.dragging
    p = mouseToSVG(e, state.scale, state.viewBox)
    for s in getByClass('selected')
      x = parseFloat(s.getAttribute('cx'))
      y = parseFloat(s.getAttribute('cy'))
      s.setAttribute('cx', x + p.x - state.mouseLast.x)
      s.setAttribute('cy', y + p.y - state.mouseLast.y)
    state.mouseLast = p
)

document.addEventListener('mouseup', (e) ->
  state.dragging = false
  state.mouseLast = null
)

document.addEventListener('mouseout', (e) ->
  if state.spacePressed and (e.relatedTarget is null)
    state.mouseLast = null
)

window.addEventListener('resize', (e) ->
  state.viewBox.width = window.innerWidth * state.scale
  state.viewBox.height = window.innerHeight * state.scale
  updateViewBox(getId('svg'), state.viewBox)
)

window.addEventListener('wheel', (e) ->
  p = mouseToSVG(e, state.scale, state.viewBox)
  state.scale = state.scale * (1 + e.deltaY / 100)
  state.viewBox = {
    x: p.x - e.x * state.scale
    y: p.y - e.y * state.scale
    width: window.innerWidth * state.scale
    height: window.innerHeight * state.scale
  }
  updateViewBox(getId('svg'), state.viewBox)
)
