const WIDTH = 500
const HEIGHT = 500

let grayScaleCheckbox
let useGrayScale = false
let cachedGrayScale = false

const waterColor = [15, 94, 156]
const sandColor = [194, 178, 128]
const grassColor = [86, 125, 70]
const mountainColor = [129, 139, 153]

const state = {
  seed: {
    value: 1337,
    cached: 0
  },
  frequency: {
    value: 0.02,
    cached: 0
  },
  scale: {
    value: 1,
    cached: 0
  },
  amplitude: {
    value: 1,
    cached: 0
  },
  octaves: {
    value: 1,
    cached: 0
  },
  persistence: {
    value: 0.1,
    cached: 0
  },
  lacunarity: {
    value: 6,
    cached: 0
  },
}

function setup() {
  frameRate(15)
  pixelDensity(1)
  noiseSeed(state.seed.value)
  
  createCanvas(WIDTH, HEIGHT)
  
  createModifiers("seed", 0, 1, 1000000, 1)
  createModifiers("frequency", 30, 0.001, 1, 0.001)
  createModifiers("scale", 60, 1, 100, 1)
  createModifiers("amplitude", 90, 1, 100, 1)
  createModifiers("octaves", 120, 1, 5, 1)
  createModifiers("persistence", 150, 0, 1, 0.01)
  createModifiers("lacunarity", 180, 0, 10, 1)
  
  createGrayScaleCheckbox()
}

function draw() {
  const changed = Object.keys(state).some(objectKey => 
    state[objectKey].value !== state[objectKey].cached
  )
  
  if (changed || useGrayScale !== cachedGrayScale) {
    generateTerrain()
  }
}

function createModifiers(name, positionY, sliderStart, sliderEnd, sliderStep) {
  function inputEvent() {
    state[name].value = this.value()
    state[name].slider.value(this.value())
    state[name].input.value(this.value())
  }
  
  state[name].label = createDiv(name)
  
  state[name].label.position(WIDTH + 20, positionY)
  state[name].slider = createSlider(sliderStart, sliderEnd, state[name].value, sliderStep)
  state[name].slider.parent(state[name].label)
  state[name].slider.position(100)
  
  state[name].input = createInput(state[name].value.toString())
  state[name].input.parent(state[name].label)
  state[name].input.position(250, 0)
  
  state[name].input.input(inputEvent)
  state[name].slider.input(inputEvent)
}

function createGrayScaleCheckbox() {
  grayScaleCheckbox = createCheckbox("Use Grayscale?", useGrayScale)
  grayScaleCheckbox.changed(grayScaleCheckboxEvent)
}

function grayScaleCheckboxEvent() {
  useGrayScale = grayScaleCheckbox.checked()
}

function generateTerrain() {
  Object.keys(state).some(objectKey => {
    state[objectKey].cached = state[objectKey].value
  })
  cachedGrayScale = useGrayScale
  
  noiseSeed(state.seed.value)
  loadPixels()
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let total = 0
      let octaveFrequency = state.frequency.value
      let octaveAmplitude = state.amplitude.value
      
      for (let octave = 0; octave < state.octaves.value; octave++) {
        // Returns a value from 0 to 1
        let noiseValue = noise((x / state.scale.value) * octaveFrequency, (y / state.scale.value) * octaveFrequency) * octaveAmplitude 
        
        total += noiseValue
        octaveFrequency *= state.lacunarity.value
        octaveAmplitude *= state.persistence.value
      }
      
      let index = (x + y * WIDTH) * 4
      pixels = paintTerrain(total, index)
    }
  }
  
  updatePixels()
}

function paintTerrain(noiseValue, index) {
  let noiseColor, red, green, blue
  const alpha = 255
  
  if (useGrayScale) {
    noiseColor = noiseValue * 255
    red = noiseColor
    green = noiseColor
    blue = noiseColor
  } else {
    result = getTerrainTile(noiseValue)
    red = result[0]
    green = result [1]
    blue = result[2]
  }

  pixels[index + 0] = red
  pixels[index + 1] = green
  pixels[index + 2] = blue
  pixels[index + 3] = alpha

  return pixels
}

function getTerrainTile(noiseValue) {
  if (noiseValue <= 0.5) {
    return waterColor
  } else if (noiseValue <= 0.55) {
    return sandColor
  } else if (noiseValue <= 0.75) {
    return grassColor
  } else {
    return mountainColor
  }
}