var currentAlgo, interval, interval2, running

var debugSlow = $('#slow:checked').length

function randomCell() {
  return Math.floor(Math.random() * 25)
}

function randomItem(a) {
  return a[Math.floor(Math.random() * a.length)]
}


function toggledSlow() {
  debugSlow = $('#slow:checked').length
}
function toggleDebugSlow() {
  setDebugSlow(!$('#slow:checked').length)
}
function setDebugSlow(slow) {
  $('#slow').prop('checked', slow);
  debugSlow = slow
}


function toggleAlgo(algoId, evt, slow) {
  //
  if (evt) {
    setDebugSlow(slow)
  }
  if (running) {
    running = 0
    clearTimeout(interval)
  } else {
    currentAlgo = algo[algoId] || {}
    currentAlgo.drawStep = algo[algoId].drawStep || currentAlgo.delay > 100
    running = currentAlgo.repeat || 1000
    if (currentAlgo.delay && typeof currentAlgo.delay !== 'number') {
      return alert('delay must be an integer')
    }

    runStep()
  }
  setButtonText()
}

function setButtonText() {
  if (running) {
    $('button').text('Stop')
  } else {
    $('button.play').text('Play')
    $('button.slow').text('Slow')
  }
}

function runStep() {
  selected = currentAlgo.step()

  // Algo selected something
  if (selected)  {
    evaluate_selected()
    if (currentAlgo.drawStep || debugSlow) {
      calcStats()
      draw()
    }
  }

  // Algo gave up
  else {
    addScoreToAlgo(currentAlgo)
    if (debugSlow) {
      running = 0
    }
    if (running > 0) {
      running--;
    }
    setButtonText()
    restart()
  }

  // Keep going
  if (running) {
    clearTimeout(interval)
    interval = setTimeout(runStep, debugSlow ? currentAlgo.delay || 500 : 0)
  }
}

function getCurrentScore() {
  return parseInt($('#score').text())
}

function addScoreToAlgo(a) {
  if (a.scores.length === 10 && score < a.scores[9]) {
    return
  }
  a.scores.push(score)
  a.scores.sort((a, b) => b - a)
  a.scores = a.scores.slice(0, 10)

  $('#topscore').text(a.scores.join('\n'))
  score = 0
}

function loadAlgos() {
  var html = ''
  for (var i = 0; i < algo.length; i++) {
    // Add scores array
    algo[i].scores = []

    // Add html in view
    html += '<div>' + 
      ' <button class="play" onclick="toggleAlgo(' + i + ', event, false)">Play</button>' +
      ' <button class="slow" onclick="toggleAlgo(' + i + ', event, 1)">Slow</button>' +
      ' ' + algo[i].name +
      '</div>'
  }
  document.querySelector('#algo').innerHTML = html
}
loadAlgos()
