// NestedGrid

function valueAt(grid, a, b) {
  if (typeof b === 'undefined') {
    return grid[a % square_count][Math.floor(a / square_count)]
  }
  return grid[a][b]
}

function valuesAt(grid, indices) {
  return indices.map(i => valueAt(grid, i))
}

// FlatGrid
function toFlat(nested) {
  var flat = []
  for (var i = 0; i < nested.length * nested.length; i++) {
    flat.push(valueAt(nested, i))
  }
  return flat
}

function fromFlat(flat) {
  var nested = []
  for (var i = 0; i < square_count; i++) {
    nested.push([])
    for (var j = 0; j < square_count; j++) {
      nested[i].push(flat[j + 5 * i])
    }
  }
  return nested
}

// Cell

function getNeighbours(flatGrid, index) {
  neighbours = []
  // left
  if (index % square_count != 0) {
    neighbours.push(flatGrid[index - 1])
  }
  // right
  if ((index + 1) % square_count != 0) {
    neighbours.push(flatGrid[index + 1])
  }
  // above
  if (index >= square_count) {
    neighbours.push(flatGrid[index - square_count])
  }
  // under
  if (index < square_count ** 2 - square_count) {
    neighbours.push(flatGrid[index + square_count])
  }
  return neighbours;
}

// TODO: fix 5
function toCellIndex(grid, a, b) {
  return a + 5 * b
}

function applyRandom(flatGrid) {
  var flat = flatGrid.slice()
  for (var i = 0; i < grid.length * grid.length; i++) {
    if (!flat[i]) {
      flat[i] = Math.random()
    }
  }
}
// Return an array of flatGrids which differentiate on index
function applyRandomAt(flatGrid, index) {
  var x = [1, 2, 3].map(i => {
      // before index + i + after index
      return flatGrid.slice(0, index).concat(i, flatGrid.slice(index + 1))
    })
    // console.log(x)
  return x
}

// Snake

// Returns all possible grids after applying a snake
function applySnakeAndRandom(grid, snake) {
  const flatGrid = toFlat(grid)
  const last = snake[snake.length - 1]
  flatGrid[last] = toSnakeValue(snake)
  var x = snake.slice(0, -1).reduce((grids, index) => [].concat.apply([],
    grids.map(g => applyRandomAt(g, index))
  ), [flatGrid])
  return x
}

// Returns grid
function applySnake(grid, snake) {
  const flatGrid = toFlat(grid)

  for (var i = 0; i < snake.length - 1; i++) {
    flatGrid[snake[i]] = 0
  }

  const last = snake[snake.length - 1]
  flatGrid[last] = toSnakeValue(snake)
  return flatGrid
}

function applySnakes(grid, snakes) {
  console.warn('to implement .map(applySnake)')
  return
}

function countSnakes(grid) {
  let count = 0
  for (var i = 0; i < grid.length - 1; i++) {
    for (var j = 0; j < grid.length; j++) {
      // Compare horizontal
      if (grid[i][j] === grid[i + 1][j]) {
        count++
      }
      // Compare vertical
      if (grid[j][i] === grid[j][i + 1]) {
        count++
      }
    }
  }
  return count
}

function toAllSnakes(outs) {
  // Not sure exactly how, but to flatten an array 1 level:
  // [].concat().apply([], someArray)

  var x = [].concat.apply([], toSnakes(outs))
    // console.log(x.map(isSnakeValid))
  return x
}

function toSnakes(outs) {
  const snakes = []
  var someSnakes = outs.map((v, i) => [i])
  for (var i = 0; i < 5; i++) {
    snakes.push(someSnakes = growSnakes(outs, someSnakes))
  }
  // console.log(snakes.map(len => len.map(isSnakeValid)))
  return snakes
}

function growSnakes(outs, snakes) {
  return snakes.reduce((list, s) => list.concat(
    outs[last(s)]
    .filter(o => s.indexOf(o) === -1)
    .map(o => s.concat(o))
  ), [])
}

function last(a) {
  return a[a.length - 1]
}

function toSnakeValue(s) {
  return s.length * valueAt(grid, s[0])
}

function isSnakeValid(s) {
  if (!s.length) {
    return false
  }

  // Check if it's an actual snake
  var values = [];
  var value = valueAt(grid, s[0])
  for (var i = 0; i < s.length - 1; i++) {
    if (!isNeighbor(s[i], s[i + 1])) {
      return s
    }
    if (valueAt(grid, s[i + 1]) !== value) {
      return 0
    }
  }

  return true
}

function toOuts(grid) {
  const snakes = []
  for (let i = 0; i < grid.length * grid.length; i++) {
    snakes.push([])
  }
  for (let i = 0; i < sqsq; i++) {
    if (valueAt(grid, i) != 0) {
      if (i < 20 && valueAt(grid, i) === valueAt(grid, i + 5)) {
        snakes[i].push(i + 5)
        snakes[i + 5].push(i)
      }
      if (i % 5 && valueAt(grid, i) === valueAt(grid, i - 1)) {
        snakes[i].push(i - 1)
        snakes[i - 1].push(i)
      }
    }
  }
  return snakes
}

function countOuts(outs) {
  return outs.reduce((s, out) => s += out.length, 0)
}

function sum(outs) {
  if (Array.isArray(outs)) {
    return outs.reduce((s, term) => s += sum(term), 0)
  }
  return outs
}


/*!
 * array-unique <https://github.com/jonschlinkert/array-unique>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */
function _unique(arr) {
  if (!Array.isArray(arr)) {
    console.warn(arr)
    throw new TypeError('array-unique expects an array.')
  }

  var len = arr.length
  var i = -1

  while (i++ < len) {
    var j = i + 1

    for (; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1)
      }
    }
  }
  return arr
}

// HTML

function toTableIndices(grid) {
  const table = document.createElement('table')

  for (var i = 0; i < grid.length; i++) {
    const row = table.insertRow(i)
    for (var j = 0; j < grid.length; j++) {
      const cell = row.insertCell(j)
      cell.innerHTML = grid[j][i]
    }
  }
  table.insertRow(0).insertCell(0).innerHTML = '--'
  for (var i = 0; i < grid.length; i++) {
    const row = table.insertRow(i)
    for (var j = 0; j < grid.length; j++) {
      const cell = row.insertCell(j)
      cell.innerHTML = toCellIndex(grid, j, i)
    }
  }

  return table
}

function toTableValues(grid) {
  const table = document.createElement('table')
  return table
}

function toTextNode(t) {
  return document.createTextNode(t)
}
