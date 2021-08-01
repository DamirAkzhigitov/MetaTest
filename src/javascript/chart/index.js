const WIDTH = 600
const HEIGHT = 200
const DPI_WIDTH = WIDTH * 2
const DPI_HEIGHT = HEIGHT * 2
const ROWS_COUNT = 3
const PADDING = 40
const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2
const VIEW_WIDTH = DPI_WIDTH
const MARGIN = 20

const getMinMax = (data) => {
  let min, max

  for (const [, y] of data) {
    if (typeof min !== 'number') min = y
    if (typeof max !== 'number') max = y

    if (min > y) min = y
    if (max < y) max = y
  }

  return [min, max]
}

const line = (ctx, coords) => {
  ctx.beginPath()
  ctx.lineWidth = 4
  ctx.strokeStyle = '#ffffff'
  for (const [x, y] of coords) {
    ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.closePath()
}

const dot = (ctx, x, y, radius, color) => {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false) // specify that it's an arc
  ctx.fillStyle = color // add a fill color
  ctx.fill()
  ctx.closePath()
}

const dots = (ctx, coords) => {
  for (const [x, y] of coords) {
    dot(ctx, x, y, 12, '#ffffff')
    dot(ctx, x, y, 6, '#518dff')
  }
}

const background = (ctx, coords) => {
  ctx.beginPath()
  ctx.lineWidth = 4
  ctx.strokeStyle = 'rgba(255,255,255,0.62)'
  ctx.lineTo(PADDING - MARGIN, DPI_HEIGHT)
  for (const [x, y] of coords) {
    ctx.lineTo(x, y)
  }
  ctx.lineTo(DPI_WIDTH - MARGIN, DPI_HEIGHT)
  ctx.lineTo(PADDING - MARGIN, DPI_HEIGHT)
  ctx.fillStyle = 'rgba(255,255,255,0.29)'
  const gradient = ctx.createLinearGradient(0, DPI_WIDTH, 0, 0)
  gradient.addColorStop(0, 'rgba(255,255,255,0.10)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.25)')
  gradient.addColorStop(1, 'rgba(173,255,248,0.45)')
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.stroke()
  ctx.closePath()
}

const toNum = (num) => Math.floor(num)

const yAxis = (min, max) => {
  const step = VIEW_HEIGHT / ROWS_COUNT
  const textStep = (max - min) / ROWS_COUNT
}

export default (canvas, data) => {
  const ctx = canvas.getContext('2d')

  const [yMin, yMax] = getMinMax(data)
  const yRatio = (yMax - yMin) / VIEW_HEIGHT
  const xRatio = toNum((VIEW_WIDTH - PADDING) / (data.length - 1))
  const step = toNum(VIEW_HEIGHT / ROWS_COUNT)
  const textStep = toNum((yMax - yMin) / ROWS_COUNT)

  canvas.style.height = HEIGHT + 'px'
  canvas.style.width = WIDTH + 'px'

  canvas.width = DPI_WIDTH
  canvas.height = DPI_HEIGHT

  ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT)

  ctx.beginPath()
  ctx.strokeStyle = '#d6d6d6'
  ctx.fillStyle = '#d6d6d6'
  ctx.font = 'bold 25px Helvetica,sans-serif'
  for (let i = 0; i <= ROWS_COUNT; i++) {
    const y = step * i
    const text = Math.round(yMax - textStep * i)
    ctx.fillText(text.toString(), 5, y + PADDING)
    ctx.moveTo(PADDING, y + PADDING)
    ctx.lineTo(DPI_WIDTH, y + PADDING)
  }
  ctx.stroke()
  ctx.closePath()

  ctx.beginPath()
  ctx.strokeStyle = '#d6d6d6'
  ctx.font = 'bold 25px Helvetica,sans-serif'
  for (let i = 0; i <= data.length; i++) {
    const x = xRatio * i + MARGIN
    const text = Math.round(i + 1)
    ctx.fillText(text.toString(), x, DPI_HEIGHT - 10)
  }
  ctx.stroke()
  ctx.closePath()

  const preparedData = data.map(([x, y]) => {
    const xAxis = Math.floor(x * xRatio + MARGIN)
    const yAxis = DPI_HEIGHT - PADDING - (y - yMin) / yRatio + 1

    return [xAxis, yAxis]
  })

  background(ctx, preparedData)

  line(ctx, preparedData)

  dots(ctx, preparedData)
}
