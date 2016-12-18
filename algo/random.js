// Benchmark
// 212
// 212
// 195
// 195
// 191
// 183
// 182
// 180
// 180
// 178

algo.push({
  name: 'random',
  step () {

    // Select a random snake
    return randomItem(toAllSnakes(toOuts(grid)))
  }
})
