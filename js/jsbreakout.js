var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var x = canvas.width/2;
var y = canvas.height-30;
var ballSpeed = canvas.width/80;

// controls
var rightPressed = false;
var leftPressed = false;
var pausedGame = false;
var activeGame = false;
var endedGame = false;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
  if(e.keyCode == 39) {
      rightPressed = true;
  }
  else if(e.keyCode == 37) {
      leftPressed = true;
  }
}

function keyUpHandler(e) {
  if(e.keyCode == 39) {
      rightPressed = false;
  }
  else if(e.keyCode == 37) {
      leftPressed = false;
  }
  else if (e.keyCode == 32) {
        togglePauseGame();
  }
}

function togglePauseGame() {
  if (!pausedGame) {
    if(!activeGame) {
      activeGame = true;
      if(endedGame) {
        endedGame = false;
        document.location.reload();
      }
    } else {
      pausedGame = true;
    }
  }
  else {
    pausedGame = false;
  }
}

// lives;
var lives = 3;
function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

// score
var score = 0;
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: "+score, 60, 20);
}

// bricks
var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

var bricks = [];
for(c=0; c<brickColumnCount; c++) {
  bricks[c] = [];
  for(r=0; r<brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}


function drawBricks() {
  for(c=0; c<brickColumnCount; c++) {
      for(r=0; r<brickRowCount; r++) {
        if(bricks[c][r].status == 1) {
          var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
          var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = "#0095DD";
          ctx.fill();
          ctx.closePath();
        }
      }
  }
}

// ball
var ballRadius = 10;
var dx = ballSpeed/2; // default was 2
var dy = - ballSpeed/2;

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// paddle
var paddleHeight = 10;
var paddleWidth = canvas.width/7;
var paddleSpeed = canvas.width/80-1;
var paddleX = (canvas.width-paddleWidth)/2;

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawOverlay(text) {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.font = "30px Courier New";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.closePath();
}

function collisionDetection() {
  for(c=0; c<brickColumnCount; c++) {
      for(r=0; r<brickRowCount; r++) {
          var b = bricks[c][r];
          if(b.status == 1) {
            if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
            dy = -dy;
            b.status = 0;
            score++;
            if(score == brickRowCount*brickColumnCount) {
              activeGame = false;
              endedGame = true;
            }
          }
        }
      }
  }
}

function draw() {
  // drawing code
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
}

function moveBall() {
  // bounce off the walls left and right
  if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
      dx = -dx;
  }
  // bounce the ball from top
  if(y + dy < ballRadius) {
      dy = -dy;
  } else if(y + dy > canvas.height-ballRadius) {
      // bounce from paddle
      if(x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
          if (x < (paddleX + paddleWidth * 0.5) ) {
            // paddle it on left corner
            dx = - ballSpeed / 2;
          } else if (x > (paddleX - paddleWidth * 0.95 ) ) {
            // paddle hit on right corner
            dx = ballSpeed / 2;
          }
          if(rightPressed){
            dx += 1;
            if (0>dx) {dy-=1} else {dy+=1};
          } else if (leftPressed) {
            dx -=1;
            if (0<dx) {dy-=1} else {dy+=1};
          }
      }
      else {
        // ball out
        lives--;
        if(!lives) {
          activeGame = false;
        }
        else {
            x = canvas.width/2;
            y = canvas.height-30;
            dx = 2;
            dy = -2;
            paddleX = (canvas.width-paddleWidth)/2;
        }
      }
  }
  x+=dx;
  y+=dy;
}

function movePaddle() {
  if(rightPressed && paddleX < canvas.width-paddleWidth) {
      paddleX += paddleSpeed;
  }
  else if(leftPressed && paddleX > 0) {
      paddleX -= paddleSpeed;
  }
}

function breakout() {
  draw();
  movePaddle();
  if( !pausedGame && activeGame ) {
    moveBall();
    collisionDetection();
  } else {
    if (pausedGame) {
      drawOverlay("Game Paused");
    } else if (!lives) {
      drawOverlay("Game Over");
    } else if(endedGame) {
      drawOverlay("YOU WIN!");
    } else {
      drawOverlay("SPACE to start.");
    }
  }
  requestAnimationFrame(breakout);
}

pausedGame = false;
activeGame = false;
breakout();
