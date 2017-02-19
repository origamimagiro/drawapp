SVGNS = 'http://www.w3.org/2000/svg'
getId = (id) -> document.getElementById(id)
setAttrs = (el, attrs = {}) -> el.setAttribute(k, v) for k, v of attrs; el
hasAttrs = (el, attrs) -> attrs.every((a) -> el.hasAttribute(a))
createElement = (tag, attrs) -> setAttrs(document.createElement(tag), attrs)
createSVG = (tag, attrs) -> setAttrs(document.createElementNS(SVGNS, tag),attrs)
makePath = (coords) ->
  ("#{if (i is 0) then 'M' else 'L'} #{c[0]} #{c[1]} " for c, i in coords)
    .reduce((a,b) -> a + b)
makeCycle = (coords) -> makePath(coords) + 'Z'

KEYMAP = {
  8:  'delete'  # 'backspace'
  16: 'shift'   # 'shift'
  27: 'esc'     # 'escape'
  32: 'pan'     # 'space'
  79: 'ellipse' # 'o'
  80: 'pen'     # 'p'
  86: 'select'  # 'v'
}
CURSORS = {
  pen:     'crosshair'
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
  selection: []
}

updateViewBox = (el, v) ->
  setAttrs(el, {viewBox: "#{v.x} #{v.y} #{v.width} #{v.height}"})

mouseToSVG = (p, state) ->
  return {
    x: p.x * state.scale + state.viewBox.x
    y: p.y * state.scale + state.viewBox.y
  }

window.onload = () ->
  svg = createSVG('svg', {
    id: 'top', width: '100%', height: '100%', xmlns: SVGNS})
  svg.appendChild(createSVG('style', {id: 'appStyles'})) .innerHTML =
    'circle:hover { stroke: #F00; } #interface > circle { stroke: #00F }'
  svg.appendChild(createSVG('style', {id: 'graphicStyles'}))
  svg.appendChild(createSVG('g', {id: 'artBoards'}))
    .appendChild(createSVG('rect', {
      x: 0, y: 0, width: '800', height: '600', stroke: 'none', fill: '#FFF'}))
  svg.appendChild(createSVG('g', {id: 'layer1'}))
  svg.appendChild(createSVG('g', {id: 'interface'}))
  getId('body').appendChild(svg)

  state.viewBox = {
    x: 0
    y: 0
    width: window.innerWidth
    height: window.innerHeight
  }
  updateViewBox(svg, state.viewBox)

deactivate = () ->
  if state.active?.node?
    state.active.node.remove()
    state.active = null

deselect = () ->
  deactivate()
  if state.selection.length > 0
    for s in state.selection
      s.image.remove()
      s.target.classList.remove('selected')
    state.selection = []

deleteSelection = () ->
  selected = document.getElementsByClassName('selected')
  (selected.item(0).remove() while selected.length > 0)
  deselect()

# Event Listeners
document.addEventListener('keydown', (e) ->
  key = KEYMAP[e.keyCode]
  switch key
    when 'esc'    then deselect(); break
    when 'delete' then deleteSelection(); break
    when 'shift'  then state.shiftPressed = true; break
    when 'pan'
      getId('body').style.cursor = CURSORS.pan
      state.spacePressed = true
      break
    when 'pen', 'ellipse', 'select'
      break if key is state.mode # mode didn't change
      deactivate()
      state.mode = key
      getId('body').style.cursor = CURSORS[state.mode]
      break
)
document.addEventListener('keyup', (e) ->
  key = KEYMAP[e.keyCode]
  switch key
    when 'shift' then state.shiftPressed = false
    when 'pan'
      state.spacePressed = false
      getId('body').style.cursor = CURSORS[state.mode]
)
document.addEventListener('mousedown', (e) ->
  state.mouseLast = mouseToSVG(e, state)
  if state.mode is 'ellipse'
    if state.active is null
      deselect()
      c = mouseToSVG(e, state)
      state.active = {cx: c.x, cy: c.y, r: 0}
      state.active.node = setAttrs(createSVG('circle', state.active), {
        stroke: '#000', fill: 'none', 'stroke-width': 2 })
      getId('layer1').appendChild(state.active.node)
    else
      state.active = null
  if state.mode is 'select'
    switch e.target.nodeName
      when 'circle', 'rect', 'path'
        if getId('layer1').contains(e.target)
          deselect() if not state.shiftPressed
          state.selection.push({
            target: e.target
            image: getId('interface').appendChild(e.target.cloneNode())
          })
          e.target.classList.add('selected')
          state.dragging = true
        if getId('interface').contains(e.target) and state.shiftPressed
          for s, i in state.selection
            if s.image.contains(e.target)
              s.target.classList.remove('selected')
              s.image.remove()
              state.selection.splice(i, 1)
              break
        if getId('interface').contains(e.target)
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
    updateViewBox(getId('top'), state.viewBox)
  if (state.mode is 'ellipse') and (state.active isnt null)
    c = mouseToSVG(e, state)
    r = Math.sqrt(
      (state.active.cx - c.x) * (state.active.cx - c.x) +
      (state.active.cy - c.y) * (state.active.cy - c.y))
    setAttrs(state.active.node, {r: r})
  if (state.mode is 'select') and state.dragging
    p = mouseToSVG(e, state)
    for s in state.selection
      x = parseFloat(s.target.getAttribute('cx'))
      y = parseFloat(s.target.getAttribute('cy'))
      s.target.setAttribute('cx', x + p.x - state.mouseLast.x)
      s.target.setAttribute('cy', y + p.y - state.mouseLast.y)
      s.image.setAttribute('cx', x + p.x - state.mouseLast.x)
      s.image.setAttribute('cy', y + p.y - state.mouseLast.y)
    state.mouseLast = p
)
document.addEventListener('mouseup', (e) ->
  state.dragging = false
  state.mouseLast = null
)
document.addEventListener('mouseout', (e) ->
  if state.spacePressed and (e.relatedTarget is null) and
     (state.mouseLast isnt null)
    state.mouseLast = null
)
window.addEventListener('resize', (e) ->
  state.viewBox.width = window.innerWidth * state.scale
  state.viewBox.height = window.innerHeight * state.scale
  updateViewBox(getId('top'), state.viewBox)
)
window.addEventListener('wheel', (e) ->
  p = mouseToSVG(e, state)
  state.scale = state.scale * (1 + e.deltaY / 100)
  state.viewBox = {
    x: p.x - e.x * state.scale
    y: p.y - e.y * state.scale
    width: window.innerWidth * state.scale
    height: window.innerHeight * state.scale
  }
  updateViewBox(getId('top'), state.viewBox)
)
