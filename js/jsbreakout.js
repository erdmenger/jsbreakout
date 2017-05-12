var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
// dynamic window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// the field
var gameField = { "width": canvas.width - 20,
                  "height": canvas.height - 40,
                  "offsetLeft": canvas.offsetLeft,
                  "xOffset": 10,
                  "yOffset": 30 };

var ballSpeed = gameField.width/60;
var lives = 3;

// controls
var gameStates = { "active": 0, "paused": 1, "win": 2, "gameover": 3, "leveldone": 4 };
Object.freeze(gameStates);

var rightPressed = false;
var leftPressed = false;
var gameState = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, {passive: false, capture: false});

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
  if (gameState === gameStates.paused) {
    gameState = gameStates.active;
  } else if (gameState === gameStates.active) {
    gameState = gameStates.paused;
  } else if (gameState === gameStates.gameover) {
      gameState = gameStates.active;
      initialize();
  } else if (gameState === gameStates.win) {
      gameState = gameStates.active;
      initialize();
  } else if (gameState === gameStates.leveldone) {
    gameState = gameStates.active;
    initialize();
  } else {
    gameState = gameStates.active;
  }
}

// lives;
function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Lives: "+lives, gameField.width-65, 20);
}

// score
var score = 0;
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: "+score, 60, 20);
}

function drawDXDY() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("[dx:dy] [" + dx + " : " + dy + "]", gameField.width/2-30, 20);
}

// initialize
var brickRowCount = 2;
var brickColumnCount = 5;
var brickWidth = gameField.width/(brickColumnCount + 1);    // 75 was default
var brickHeight = brickWidth * 0.3;
var brickPadding = brickWidth/(brickColumnCount + 1); // default was 10;
var brickOffsetTop = gameField.height *.2;
var brickOffsetLeft = brickWidth/(brickColumnCount + 1); // default was 30;

var levels = [];
levels[0] = {row:1, column:5, speed:gameField.width/80 };
levels[1] = {row:2, column:5, speed:gameField.width/80 };
levels[2] = {row:3, column:5, speed:gameField.width/80 };
levels[3] = {row:2, column:8, speed:gameField.width/60 };
levels[4] = {row:3, column:11, speed:gameField.width/60 };
levels[5] = {row:3, column:11, speed:gameField.width/60 };

var numLevel = 6;     // array length including [0]
var currentLevel = 0;
var bricks = [];
var numBricks = 0;
var tempoOffset = 0;

function initialize() {
  brickColumnCount = levels[currentLevel].column;
  brickRowCount = levels[currentLevel].row;
  ballSpeed = levels[currentLevel].speed + tempoOffset;
  numBricks = 0;
  x = gameField.width/2;
  y = paddleY - ballRadius * 2 + 2;
  dx = ballSpeed / 2;
  dy = ballSpeed / 2;

  for(c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(r=0; r<brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: brickRowCount-r };
      numBricks += 1;
    }
  }
//  currentLevel += 1;
}

function drawBricks() {
  for(c=0; c<brickColumnCount; c++) {
    for(r=0; r<brickRowCount; r++) {
      if(bricks[c][r].status > 0) {
        var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
        var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        if (3 == bricks[c][r].status) {
          ctx.fillStyle = "black";
        } else if (2 == bricks[c][r].status) {
          ctx.fillStyle = "darkblue";
        } else {
          ctx.fillStyle = "#0095DD";
        }
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// ball
var ballRadius = gameField.width/80; // default was 8
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
var paddleWidth = gameField.width/7;
var paddleSpeed = gameField.width/80-1;
var paddleX = (gameField.width-paddleWidth)/2;
var paddleY = gameField.height - ballRadius - paddleHeight;

var x = gameField.width/2;
var y = paddleY - ballRadius * 2 + 2;

function mouseMoveHandler(e) {
    var relativeX = e.clientX - gameField.offsetLeft;
    if(relativeX > gameField.xOffset && relativeX < gameField.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}


function touchMoveHandler(e) {
  if (gameState === gameStates.active) {
    e.preventDefault();

    var touches = e.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        var touch = touches[i];
        if (touch.clientY > gameField.height-50) {
          movePaddleByClientX(touch.clientX);
        } else {
          togglePauseGame();
        }
    }
  } else {
    togglePauseGame();
  }
}

function movePaddleByClientX(clientX) {
    var relativeX = clientX - gameField.offsetLeft;
    if (relativeX > gameField.xOffset && (relativeX + (paddleWidth / 2)) < gameField.width) {
        var newX = relativeX - paddleWidth / 2;

        if (newX <= gameField.xOffset) {
            paddleX = gameField.xOffset;
        } else if (newX >= gameField.width) {
            paddleX = gameField.width;
        } else {
            paddleX = newX;
        }
    }
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, gameField.height-paddleHeight-10, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function collisionDetection() {
  for(c=0; c<brickColumnCount; c++) {
    for(r=0; r<brickRowCount; r++) {
      var b = bricks[c][r];
      if(b.status > 0) {
        if( x+ballRadius > b.x && x-ballRadius < b.x+brickWidth && y+ballRadius > b.y && y-ballRadius < b.y+brickHeight) {
          if( (x < b.x+ballRadius && dx>0) ||
              (x > b.x+brickWidth-ballRadius && dx<0) ) {
            dx = -dx;
          } else {
            dy = -dy;
          }
          score++;
          b.status -= 1;
          if (0 === b.status) {
          numBricks -= 1;
            if(0 === numBricks) {
              gameState = gameStates.leveldone;
              currentLevel += 1;
              if (currentLevel === numLevel) {
                currentLevel = 0;
                tempoOffset = 1;
              }
            }
          }
        }
      }
    }
  }
}


function drawOverlay(text) {
    ctx.beginPath();
    ctx.rect(gameField.xOffset, gameField.yOffset,
      gameField.width-gameField.xOffset, gameField.height-gameField.yOffset);
    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.font = "30px Courier New";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(text, gameField.width / 2, gameField.height / 2);
    ctx.closePath();
}

function drawBoard() {
  ctx.strokeStyle = "#0095DD";
  ctx.lineWidth = '2';
  ctx.strokeRect(gameField.xOffset-1, gameField.yOffset-1,
    gameField.width-gameField.xOffset, gameField.height-gameField.yOffset);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBoard();
  drawBricks();
  drawScore();
  drawBall();
  drawPaddle();
  drawLives();
}

function moveBall() {
  // bounce off the walls left and right
  if(x + dx > gameField.width-ballRadius || x + dx < ballRadius+gameField.xOffset) {
      dx = -dx;
  }
  // bounce the ball from top
  if(y + dy < ballRadius + gameField.yOffset) {
      dy = -dy;
  } else if(y + dy > paddleY ) {
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
          gameState = gameStates.gameover;
        }
        else {
            x = gameField.width/2;
            y = gameField.height-30;
            dx = 2;
            dy = -2;
            paddleX = (gameField.width-paddleWidth)/2;
        }
      }
  }
  x+=dx;
  y+=dy;
}

function movePaddle() {
  if(rightPressed && paddleX < gameField.width-paddleWidth) {
      paddleX += paddleSpeed;
  }
  else if(leftPressed && paddleX > 0) {
      paddleX -= paddleSpeed;
  }
}

function splashscreen() {

      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,0,0,.2)";
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.font = "35px Courier New";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText("j s B R E A K O U T", gameField.width / 2, gameField.height / 2 - 40);
      ctx.closePath();

      ctx.beginPath();
      ctx.font = "25px Courier New";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText("Press SPACE to start.", gameField.width / 2, gameField.height/2 + 50);
      ctx.fillText("LEFT, RIGHT or use MOUSE ", gameField.width / 2, gameField.height/2 + 80);
      ctx.fillText("to move the paddle.", gameField.width / 2, gameField.height/2 + 110);
      ctx.fillText("or TOUCH the screen", gameField.width / 2, gameField.height/2 + 150);
      ctx.closePath();

}

function breakout() {
  draw();
  movePaddle();
  if( gameState === gameStates.active ) {
    moveBall();
    collisionDetection();
  } else if (gameState === gameStates.paused) {
      drawOverlay("Game Paused");
      splashscreen();
  } else if (gameState === gameStates.gameover) {
    drawOverlay("Game Over");
  } else if(gameState === gameStates.win) {
    drawOverlay("YOU WIN!");
  } else if (gameState === gameStates.leveldone) {
    drawOverlay("Get Ready for Level " + (currentLevel+1)*(tempoOffset+1));
    splashscreen();
  } else {
    drawOverlay("Get Ready!");
    splashscreen();
  }
  requestAnimationFrame(breakout);
}

initialize();
breakout();
