algo.push({
  name: 'thomas',
  step() {
    const allSnakes = toAllSnakes(toOuts(grid)).slice(0, 10000)
    const scores = allSnakes.map(s => this.snakeHeuristic(s))
    return allSnakes[indexOfMax(scores)]
  },
  snakeHeuristic(snake) {
    // Basic grid heuristics
    let score = getAvgOfArray(
      applySnakeAndRandom(grid, snake).map(this.gridHeuristic)
    )
    const afterGrid = applySnake(grid, snake)

    // Prefer big numbers on the side
    const index = last(snake)
    if (index < sq || index >= sqsq - sq) {
      score *= 2
      if (index % sq === 0 || index % sq === 4) {
        score *= 10
      }
    }
    if (index % sq === 0 || index % sq === 4) {
      score *= 2
    }

    // Prefer n6
    const value = toSnakeValue(snake)
    const sixes = n6.indexOf(value) + 1
    score *= sixes * value

    // Prefer friendly neighbors
    const neighbors = getNeighbours(afterGrid, last(snake))
    // const sixes = n3.indexOf(value)
    // score += (sixes + 3) * value



    return score
  },
  gridHeuristic(flatGrid) {
    // return score
    let score = 0

    // Lot's of outs please
    score += countOuts(toOuts(fromFlat(flatGrid)))

    // // Lot's of outs please
    // score += getMaxOfArray(
    //   flatGrid.map(fromFlat).map(toOuts).map(countOuts)
    // )

    return score
  }
})
