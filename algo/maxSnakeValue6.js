// Benchmark
// 318
// 256
// 254
// 254
// 248
// 242
// 230
// 228
// 228
// 226

algo.push({
  name: 'maxSnakeValue6',
  step() {
    var allSnakes = toAllSnakes(toOuts(grid));
    var best = indexOfMax(allSnakes
      .map(toSnakeValue)
      .map(v => v % 6 ? (v === 3 ? 6 : v) : 11)
    )
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
