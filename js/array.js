function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function getAvgOfArray(numArray) {
  let sum = 0
  for (var i = 0; i < numArray.length; i++) {
    sum += numArray[i]
  }
  return sum / numArray.length;
}

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
