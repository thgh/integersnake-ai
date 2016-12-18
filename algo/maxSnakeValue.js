// Benchmark
// 259
// 251
// 251
// 250
// 242
// 241
// 235
// 234
// 233
// 231

algo.push({
  name: 'maxSnakeValue',
  step() {
    var allSnakes = toAllSnakes(toOuts(grid));
    var best = indexOfMax(allSnakes.map(toSnakeValue))
    return allSnakes[best]
  }
})

// Stackoverflow: indexOf highest number
function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}
