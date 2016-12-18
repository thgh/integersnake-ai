var square_count = 5;
var sq = square_count;
var sqsq = square_count * square_count;
var n3 = [6,12,24,48,96,192,384]
var n6 = [3,6,12,24,48,96,192,384]
var m;
var selected;
var grid;
var score;
var displayScoreTimeout;
var game_over_dsp = false;
var seed;
var stats = {}
var algo = []

$(document).ready(function() {
  init();
  init_grid();
  calcStats()
  draw();
  attach_listeners();
});

function init() {
  selected = [];
  grid = [];
  score = 0;
  var w = window.innerWidth;
  var h = window.innerHeight;
  m = Math.min(w, h, 300);
  $("#game_canvas").attr("width", m);
  $("#game_canvas").attr("height", m);
  seed = Math.ceil(10000 * Math.random());
  // socket.emit("request_seed"); 
}


function calcStats() {
  const outs = toOuts(grid)
  return stats = {
    grid: grid,
    outs: outs,
    countOuts: sum(outs),
    snakes: toSnakes(outs),
    allSnakes: toAllSnakes(outs),
    countSnakes: countSnakes(grid)
  }
}


function draw() {
  var c = document.getElementById("game_canvas");
  var ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  var a = m / square_count;

  for (var i = 0; i < square_count; i++) {
    for (var j = 0; j < square_count; j++) {
      draw_square(i * a, j * a, a, i, j);
      var s = ((i + 1) * a + i * a) / 2;
      var t = ((j + 1) * a + j * a) / 2;
      draw_number(s, t, i, j);
    }
  }

  // Plain table
  var h = document.getElementById('indices')
  while (h.lastChild) {
    h.removeChild(h.lastChild);
  }
  h.appendChild(toTableIndices(grid))
  h.appendChild(toTableValues(grid))

  // Snakes
  document.getElementById('outsNum').innerText = stats.countSnakes
  document.getElementById('outsMap').innerText = stats.outs
    .map((o, i) => i + ' => ' + o.join(', '))
    .filter(s => !s.endsWith('=> '))
    .join('\n')
  document.getElementById('snakeLength').innerText = stats.snakes
    .map((s, i) => 'length ' + (i + 2) + ': ' + s.length)
    .join('\n')
}

function draw_square(x, y, a, i, j) {
  var n = grid[i][j];
  var c = document.getElementById("game_canvas");
  var ctx = c.getContext("2d");

  ctx.fillStyle = "rgb(255, " + Math.max((255 - 10 * n), 20) + ", 255)";
  if (n >= 48) { ctx.fillStyle = "rgb(255, 220, 0)"; }
  ctx.fillRect(x + 1, y + 1, x + a - 1, y + a - 1);

  ctx.rect(x, y, x + a, y + a);
  ctx.stroke();
  ctx.fillStyle = "black";
}

function draw_number(x, y, i, j) {

  var c = document.getElementById("game_canvas");
  var ctx = c.getContext("2d");
  ctx.font = "bold " + 0.08 * m + "px sans-serif";
  var textWidth = ctx.measureText(grid[i][j]).width;
  var textHeight = 0.06 * m;
  if (selected.indexOf(square_count * j + i) != -1) {
    ctx.font = 0.06 * m + "px sans-serif";
    textWidth = ctx.measureText(grid[i][j]).width;
  }
  ctx.fillText(grid[i][j], x - textWidth / 2, y + textHeight / 2);

}




function attach_listeners() {
  $("#game_canvas").mousedown(function(e) {
    var x = e.pageX - $(this).offset().left;
    var y = e.pageY - $(this).offset().top;
    var a = m / square_count;
    add_selection(square_count * Math.floor(y / a) + Math.floor(x / a));

    $("#game_canvas").mousemove(function(e) {
      var x = e.pageX - $(this).offset().left;
      var y = e.pageY - $(this).offset().top;
      var a = m / square_count;
      add_selection(square_count * Math.floor(y / a) + Math.floor(x / a));
    });

    $("#game_canvas").mouseup(function() {
      evaluate_selected();
      selected = [];
      $("#game_canvas").off();

      draw();
      attach_listeners();

      console.log('Snakes:', countSnakes(grid))
      if (check_game_over()) {
        game_over_dsp = true;
        game_over();
      }
      draw();
    });
  });

  $("#game_canvas").on("touchstart", function(e) {
    var x = e.originalEvent.touches[0].pageX - $(this).offset().left;
    var y = e.originalEvent.touches[0].pageY - $(this).offset().top;
    var a = m / square_count;
    add_selection(square_count * Math.floor(y / a) + Math.floor(x / a));
    e.preventDefault();

    $("#game_canvas").on("touchmove", function(e) {

      var x = e.originalEvent.touches[0].pageX - $(this).offset().left;
      var y = e.originalEvent.touches[0].pageY - $(this).offset().top;
      var a = m / square_count;
      add_selection(square_count * Math.floor(y / a) + Math.floor(x / a));
    });

    $("#game_canvas").on("touchend", function() {
      evaluate_selected();
      selected = [];
      $("#game_canvas").off();


      draw();
      attach_listeners();

      if (check_game_over()) {
        game_over_dsp = true;
        game_over();
      }
      draw();
    });
  });
}

function add_selection(n) {

  if (selected.length > 1) {
    var last = selected[selected.length - 2];
    if (n == last) {
      selected.pop();
      draw();
      return;
    }
  }

  if (selected.indexOf(n) != -1) {
    return;
  }

  if (selected.length > 0) {
    var last = selected[selected.length - 1];
    if (!isNeighbor(last, n)) {
      return;
    }
  }
  selected.push(n);
  draw();
}

function isNeighbor (a, b) {
  return Math.abs(a - b) === 5 || Math.abs(a - b) === 1
}

function init_grid() {
  for (var i = 0; i < square_count; i++) {
    grid[i] = new Array(square_count);
    for (var j = 0; j < square_count; j++) {
      grid[i][j] = rand_square(i, j);
    }
  }
}

function evaluate_selected() {
  if (selected.length == 0) {
    return;
  }
  var values = valuesAt(grid, selected)
  // Check if all values are the same
  var s = values[0];
  for (var i = 0; i < values.length; i++) {
    if (values[i] != s) {
      return console.warn('those values are not equal', values)
    }
  }

  // Check if it's an actual snake
  for (var i = 0; i < selected.length - 1; i++) {
    if (!isNeighbor(selected[i], selected[i + 1])) {
      return console.warn('thats not a neighbor', selected[i], selected[i + 1])
    }
  }

  // Get selected values



  var s = selected[selected.length - 1];
  var i2 = Math.floor(s / square_count);
  var j2 = s % square_count;

  var S = 0;

  for (var i = 0; i < values.length; i++) {
    S += values[i];
  }

  grid[j2][i2] = S;
  if (selected.length > 1) {
    increase_score(S);
    if (!$("#game_canvas").attr("data-moves")) {
      $("#game_canvas").attr("data-moves", JSON.stringify([selected]));
    } else {
      var prev = JSON.parse($("#game_canvas").attr("data-moves"));
      prev.push(selected);
      $("#game_canvas").attr("data-moves", JSON.stringify(prev));
    }
  }

  for (var i = 0; i < selected.length - 1; i++) {
    var s = selected[i];
    var i2 = Math.floor(s / square_count);
    var j2 = s % square_count;
    grid[j2][i2] = rand_square(j2, i2);
  }
  // draw();
  selected = []
  return true
}

function rand_square(i, j) {
  var square = 3 * random();
  return Math.ceil(square);
}

function random() {
  seed++;
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}


function check_game_over() {
  return !countSnakes(grid);
}


function game_over() {
  if (!game_over_dsp) {
    return;
  } else { game_over_dsp = false }


  $("#game_canvas").off();

  console.log('game over')

  try {
    var min_score = $("#high_score_list > li").last().html().split(" ")[1];
    var min_number = $("#high_number_list > li").last().html().split(" ")[1];

    var s = $("#wrscore").html().split(" ")
    var wr_score_n = Number(s[s.length - 1]);

    var s = $("#wrnumber").html().split(" ")
    var wr_number_n = Number(s[s.length - 1]);

    var record_score = false;
    var record_number = false;

    var wr_score = false;
    var wr_number = false;

    if (min_score < score) {
      record_score = true;
    }

    if (score > wr_score_n) {
      wr_score = true;
    }

    M = 0;

    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        if (M <= grid[i][j]) { M = grid[i][j]; }
      }
    }

    if (min_number < M) {
      record_number = true;
    }

    if (M > wr_number_n) {
      wr_number = true;
    }


    if (record_score) {
      $("#game_over_feed").append("<p>You got a daily high score!</p>");
    }
    if (record_number) { $("#game_over_feed").append("<p>You got a daily record number!</p>"); }
    if (wr_score) { $("#game_over_feed").append("<p>You got an ALL TIME record score!</p>"); }
    if (wr_number) { $("#game_over_feed").append("<p>You got an ALL TIME record number!</p>"); }
  } catch (e) {}
}


function restart() {

  try {
    var min_score = $("#high_score_list > li").last().html().split(" ")[1];
    var min_number = $("#high_number_list > li").last().html().split(" ")[1];

    var s = $("#wrscore").html().split(" ")
    var wr_score = Number(s[s.length - 1]);

    var s = $("#wrnumber").html().split(" ")
    var wr_number = Number(s[s.length - 1]);

    var record_score = false;
    var record_number = false;
    var wr_score = false;
    var wr_number = false;


    try {
      var moves = JSON.parse($("#game_canvas").attr("data-moves"));
    } catch (e) {
      var moves = [];
    }



    if (min_score < score) {
      record_score = true;
    }

    if (score > wr_score) {
      wr_score = true;
    }


    var M = 0;

    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        if (M <= grid[i][j]) { M = grid[i][j]; }
      }
    }

    if (min_number < M) {
      record_number = true;
    }

    if (M > wr_number) {
      wr_number = true;
    }
  } catch (e) {}

  // socket.emit("push_score",{score:score,number:M,nick:nick,record_score:record_score,
  //                   record_number:record_number,wr_score:wr_score,wr_number:wr_number,
  //                   first_seed:first_seed,moves:moves});

  $("#game_canvas").removeAttr("data-moves");
  seed = Math.ceil(10000 * Math.random());
  selected = [];
  grid = [];
  score = 0;
  init_grid();
}

function increase_score(S) {
  score += S;
  $("#score").html(score);
}
