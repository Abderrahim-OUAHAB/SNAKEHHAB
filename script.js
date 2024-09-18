//main canvas
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext('2d');
canvas.width=720;
canvas.height=720;
const scoreCanvas=document.getElementById("scoreCanvas");
const sctx = scoreCanvas.getContext("2d");
scoreCanvas.width=200;
scoreCanvas.height=100;
const size=30;
const gameSpeed=10;
const squareCountX=canvas.width/size;
const squareCountY=canvas.height/size;
let score;
let whiteLineThikness=1;
let isPlay=false;
const DIRECTION_RIGHT=4;
const DIRECTION_UP=3;
const DIRECTION_LEFT=2;
const DIRECTION_BOTTOM=1;














class Input {
  constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (event) => {
          let k = event.keyCode;
          setTimeout(() => {
              if (k == 37 || k == 65) { // left
                  if (this.game.snake.direction !== DIRECTION_RIGHT) { // Empêcher un demi-tour direct
                      this.game.snake.direction = DIRECTION_LEFT;
                  }
              } else if (k == 38 || k == 87) { // up
                  if (this.game.snake.direction !== DIRECTION_BOTTOM) { // Empêcher un demi-tour direct
                      this.game.snake.direction = DIRECTION_UP;
                  }
              } else if (k == 39 || k == 68) { // right
                  if (this.game.snake.direction !== DIRECTION_LEFT) { // Empêcher un demi-tour direct
                      this.game.snake.direction = DIRECTION_RIGHT;
                  }
              } else if (k == 40 || k == 83) { // bottom
                  if (this.game.snake.direction !== DIRECTION_UP) { // Empêcher un demi-tour direct
                      this.game.snake.direction = DIRECTION_BOTTOM;
                  }
              }
          });
      });
  }
}

class Snake {
  constructor(game) {
      this.game = game;
      this.x = Math.floor(canvas.width / 2 / size) * size;
      this.y = Math.floor(canvas.height / 2 / size) * size;
      this.sna = [{ x: this.x, y: this.y }];
      this.body = 1;
      this.speedX = 0;
      this.speedY = 0;
      this.maxSpeed = size;
      this.direction = DIRECTION_RIGHT;
      this.nextDirection = this.direction;
      this.fps = 0;
  }

  update() {
      this.fps++;
      if (this.fps % 5 === 0) {
          this.moveForwards();
          if (this.checkBodyCollision()) {
              this.game.gameOver = true;
          }
      }

      // Collision detection with canvas borders
      if (this.x >= this.game.width || this.x < 0 || this.y >= this.game.height || this.y < 0) {
          this.game.gameOver = true;
      }
  }

  draw(ctx) {
      this.sna.forEach((segment, index) => {
          // Adding gradient effect to snake
          let gradient = ctx.createLinearGradient(segment.x, segment.y, segment.x + size, segment.y + size);
          gradient.addColorStop(0, index === 0 ? '#ff4040' : '#32cd32'); // Red for the head, green for the body
          gradient.addColorStop(1, '#228b22');

          ctx.shadowBlur = 10;
          ctx.shadowColor = "#000"; // Black shadow for depth effect
          this.drawRect(ctx, segment.x, segment.y, size, size, gradient);
      });
  }

  drawRect(ctx, x, y, width, height, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
  }

  moveForwards() {
      // Move snake body
      for (let i = this.sna.length - 1; i > 0; i--) {
          this.sna[i] = { ...this.sna[i - 1] };
      }

      switch (this.direction) {
          case DIRECTION_RIGHT:
              this.x += this.maxSpeed;
              break;
          case DIRECTION_LEFT:
              this.x -= this.maxSpeed;
              break;
          case DIRECTION_UP:
              this.y -= this.maxSpeed;
              break;
          case DIRECTION_BOTTOM:
              this.y += this.maxSpeed;
              break;
      }

      this.sna[0] = { x: this.x, y: this.y };
  }

  checkBodyCollision() {
      for (let i = 1; i < this.sna.length; i++) {
          if (this.sna[0].x === this.sna[i].x && this.sna[0].y === this.sna[i].y) {
              return true;
          }
      }
      return false;
  }
}

// Food class with shadow effect
class Food {
  constructor(game) {
      this.game = game;
      this.randomPlaceX = parseInt(Math.random() * squareCountX);
      this.randomPlaceY = parseInt(Math.random() * squareCountY);
      this.x = this.randomPlaceX * size;
      this.y = this.randomPlaceY * size;
  }

  draw(ctx) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff6347"; // Shadow for food
      this.drawRect(ctx, this.x, this.y, size, size, "tomato");
  }

  drawRect(ctx, x, y, width, height, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
  }
}

// Game class with score display enhancements
class Game {
  constructor(width, height) {
      this.width = width;
      this.height = height;
      this.snake = new Snake(this);
      this.food = new Food(this);
      this.input=new Input(this)
      this.gameOver = false;
      this.score = 1;
  }

  update() {
      this.snake.update();
      if (this.checkCollision(this.snake.sna[0], this.food)) {
          this.snake.sna.push({ x: this.snake.x, y: this.snake.y });
          this.food = new Food(this);
          this.score++;
      }
  }

  draw(ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawBackground(ctx);
      this.snake.draw(ctx);
      this.food.draw(ctx);
      this.drawScore();
      if (this.gameOver) {
          this.drawGameOver(ctx);
      }
  }

  checkCollision(rect1, rect2) {
      return (
          rect1.x < rect2.x + size &&
          rect1.x + size > rect2.x &&
          rect1.y < rect2.y + size &&
          rect1.y + size > rect2.y
      );
  }

  drawBackground(ctx) {
      ctx.fillStyle = "#f0f8ff"; // Soft blue background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "gray";
      for (let i = 0; i < squareCountX; i++) {
          for (let j = 0; j < squareCountY; j++) {
              ctx.strokeRect(i * size, j * size, size, size);
          }
      }
  }

  drawScore() {
      sctx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
      sctx.fillStyle = "#ff4040"; // Red score font color
      sctx.font = "64px Bangers";
      sctx.textAlign = "center";
      sctx.fillText(this.score, scoreCanvas.width / 2, scoreCanvas.height / 1.5);
  }

  drawGameOver(ctx) {
      ctx.font = "74px Bangers";
      ctx.fillStyle = "black";
      ctx.fillText("Game Over!", 200, canvas.height / 2);
  }
}


function resetVars() {
    score = 0;
    gameOver = false;
};

// GAME LOOP
const game = new Game(canvas.width, canvas.height);
let lasttime = 0;
let animate = (timestamp) => {
    const deltatime = timestamp - lasttime;
    lasttime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltatime);
    game.draw(ctx);
    
    if (!game.gameOver) requestAnimationFrame(animate);
};

animate(0);

