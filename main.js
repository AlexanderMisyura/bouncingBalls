// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
// select score panels
const panelBallsLeft1 = document.querySelector('.player1 .balls_left');
const panelBallsLeft2 = document.querySelector('.player2 .balls_left');
const panelBallsCaught1 = document.querySelector('.player1 .balls_caught');
const panelBallsCaught2 = document.querySelector('.player2 .balls_caught');
// menu
const startBtn = document.querySelector('.new_game_btn');
const menuPanel = document.querySelector('.menu_panel');
const players = document.getElementById('player_choose_2');
const ballsNumberRange = document.getElementById('balls_number_range');
const showBallsNumberRange = document.querySelector('.show_balls_number_range');
// winner && pause message
const winnerMessage = document.querySelector('.win');
const pauseMessage = document.querySelector('.paused');
const menuOnBtn = document.querySelector('.menu_on_btn');

// start parameters
let minBallSize = 10;
let maxBallSize = 30;
let ballsNumber;
let playerSpeed = 10;
let isPaused = true;
let isMenuOn = true;
let player1;
let player2;
let enemyBall1;
let isPlayer2;
let winnerName;
let allControlsPressed = [];
let balls = [];
let allControls = [];

// random number generator
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// get the winner from two players
function getWinner(...last) {
    let winner;
    for (let i = 0; i < arguments.length; i++) {
        let maxCatch = arguments[0].catchCounter;
        winner = arguments[0];
        if (arguments[i].catchCounter > maxCatch) {
            winner = arguments[i];
        }
    }
    return winner;
}
// set winnerName
function setWinnerName () {
    if (ballsNumber === 0) {
        if (isPlayer2) {
            winnerName = getWinner(player1, player2).name;
        } else {
            winnerName = player1.name;
        }
    }
}
// show winner message and menu button
function showWinMessage() {
    winnerMessage.style.display = 'block';
    menuOnBtn.style.display = 'block';
    winnerMessage.textContent = `Congratulations, ${winnerName}!\nYou win!`;
    isPaused = true;
}
// update balls left
function panelBallsLeftUpdate() {
    if (isPlayer2) {
        panelBallsLeft1.textContent = `balls left: ${ballsNumber}`;
        panelBallsLeft2.textContent = `balls left: ${ballsNumber}`;
    } else {
        panelBallsLeft1.textContent = `balls left: ${ballsNumber}`;
        panelBallsLeft2.textContent = '';
    }
}
// add pressed keys used in controlling players to allControlsPressed
function keyPressed(e) {
    let key = e.code;
    if (allControls.includes(key) && !allControlsPressed.includes(key)) {
        allControlsPressed.push(key);
    }
}
// remove released keys used in controlling players from allControlsPressed
function keyReleased(e) {
    let key = e.code;
    if (allControlsPressed.includes(key)) {
        allControlsPressed = allControlsPressed.filter(pressedKey => pressedKey !== key);
    }
}
// control players
function controlling() {
    if (allControlsPressed.length > 0) {
        let player1ControlsPressed = [];
        let player2ControlsPressed = [];
        for (let i = 0; i < allControlsPressed.length; i++) {
            let key = allControlsPressed[i];
            if (player1.controls.includes(key)) {
                player1ControlsPressed.push(key);
            } else if (isPlayer2 && player2.controls.includes(key)) {
                player2ControlsPressed.push(key);
            }
        }
        player1.controlsPressed = player1ControlsPressed;
        player1.move();
        if (isPlayer2) {
            player2.controlsPressed = player2ControlsPressed;
            player2.move();
        }
    }
}
// animation frame
function makeAnimationFrame() {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < balls.length; i++) {
        if (balls[i].isNotEaten) {
            balls[i].draw();
            balls[i].update();
            balls[i].collisionDetect();
        }
    }
    enemyBall1.draw();
    enemyBall1.update();
    player1.draw();
    player1.checkBounds();
    player1.collisionDetect();
    if (isPlayer2) {
        player2.draw();
        player2.checkBounds();
        player2.collisionDetect();
    }
}
// set isMenuOn and isPaused to false, reset winner, clear area
function playPreparation() {
    isMenuOn = false;
    isPaused = false;
    winnerName = undefined;
    menuPanel.style.display = 'none';
    //clear area
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);
    balls = [];
    ballsNumber = ballsNumberRange.value;
    isPlayer2 = players.checked;
}
// set player1
function createPlayer1() {
    player1 = new PlayerCircle(
        width * .5,
        height * .5,
        'yellow',
        15,
        'player1',
        ['KeyA', 'KeyD', 'KeyW','KeyS']
    );
}
// set player2
function createPlayer2() {
    player2 = new PlayerCircle(
        width * .75,
        height * .5,
        'green',
        15,
        'player2',
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
    );
}
// show number of balls on menu panel
function showRange() {
    showBallsNumberRange.value = ballsNumberRange.value;
}
// show main menu
function menuOn() {
    isMenuOn = true;
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, width, height);
    menuPanel.style.display = 'block';
    winnerMessage.style.display = 'none';
    pauseMessage.style.display = 'none';
    menuOnBtn.style.display = 'none';
}
// pause
function togglePause(e) {
    if (e.code === 'Escape' && isPaused === false && !winnerName && !isMenuOn) {
        isPaused = true;
        pauseMessage.style.display = 'block';
        menuOnBtn.style.display = 'block';
    } else if (e.code === 'Escape' && isPaused === true && !isMenuOn) {
        isPaused = false;
        pauseMessage.style.display = 'none';
        menuOnBtn.style.display = 'none';
        loop();
    }
}
// Create balls
function createBalls() {
    while (balls.length < ballsNumber) {
        let size = random(minBallSize, maxBallSize);
        let ball = new Ball(
            // ball position always drawn at least one ball width
            // away from the edge of the canvas, to avoid drawing errors
            random(0 + size, width - size),
            random(0 + size, height - size),
            random(-7, 7),
            random(-7, 7),
            true,
            'rgb(' + random(0,255) + ',' + random(0,255) + ',' + random(0,255) +')',
            size
        );
        balls.push(ball);
    }
}
// create enemyBall
function createEnemyBall() {
    enemyBall1 = new EnemyBall(
        100,
        100,
        3,
        5,
        height*width/15000,
        5
    )
}

// enemyBall speed calculation
function speedFollow(player, enemy) {
    let deltaX = player.x - enemy.x;
    let deltaY = player.y - enemy.y;
// deltaX < 0 => go left, deltaY < 0 => go up
    let hypotenuse = Math.sqrt(deltaX**2 + deltaY**2);
    let speedX = enemy.speed * deltaX / hypotenuse;
    let speedY = enemy.speed * deltaY / hypotenuse;

    return {speedX: speedX, speedY: speedY}
}

// Animation loop
function loop() {
    if (isPaused) return;
    makeAnimationFrame();
    controlling();
    panelBallsLeftUpdate();
    setWinnerName();
    if (winnerName) {showWinMessage();}
    requestAnimationFrame(loop);
}

// ---------------------------------------
// -----------  Shape class  -------------
// ---------------------------------------

class Shape {
    constructor(x, y, velX, velY) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
    }
}

// ---------------------------------------
// -----------  Ball class  --------------
// ---------------------------------------
class Ball extends Shape {
    constructor(x, y, velX, velY, isNotEaten, color, size) {
        super(x, y, velX, velY);
        this.isNotEaten = isNotEaten;
        this.color = color;
        this.size = size;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
    update() {
        if ((this.x + this.size) >= width) {
            this.velX = -(this.velX);
        }

        if ((this.x - this.size) <= 0) {
            this.velX = -(this.velX);
        }

        if ((this.y + this.size) >= height) {
            this.velY = -(this.velY);
        }

        if ((this.y - this.size) <= 0) {
            this.velY = -(this.velY);
        }

        this.x += this.velX;
        this.y += this.velY;
    }
    collisionDetect() {
        for (let j = 0; j < balls.length; j++) {
            if (!(this === balls[j]) && balls[j].isNotEaten) {
                const dx = this.x - balls[j].x;
                const dy = this.y - balls[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.size + balls[j].size) {
                    balls[j].color = this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) +')';
                }
            }
        }
    }
}

// ---------------------------------------------
// -----------  PlayerCircle class -------------
// ---------------------------------------------
class PlayerCircle extends Shape {
    constructor(x, y, color, size, name, controls) {
        super(x, y, playerSpeed, playerSpeed);
        this.color = color;
        this.size = size;
        this.catchCounter = 0;
        this.name = name;
        this.controls = controls;
        this.controlsPressed = [];
    }
    draw() {
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.stroke();
    }
    checkBounds() {
        if ((this.x + this.size) >= width) {
            this.x -= this.size;
        }

        if ((this.x - this.size) <= 0) {
            this.x += this.size;
        }

        if ((this.y + this.size) >= height) {
            this.y -= this.size;
        }

        if ((this.y - this.size) <= 0) {
            this.y += this.size;
        }
    }
    move() {
        for (let i = 0; i < this.controlsPressed.length; i++) {
            let key = this.controlsPressed[i]
            if (key === this.controls[0]) {
                this.x -= this.velX;
            } else if (key === this.controls[1]) {
                this.x += this.velX;
            } else if (key === this.controls[2]) {
                this.y -= this.velY;
            } else if (key === this.controls[3]) {
                this.y += this.velY;
            }
        }
    }
    collisionDetect() {
        for (let j = 0; j < balls.length; j++) {
            if (balls[j].isNotEaten) {
                const dx = this.x - balls[j].x;
                const dy = this.y - balls[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.size + balls[j].size) {
                    balls[j].isNotEaten = false;
                    ballsNumber--;
                    this.catchCounter++;
                    document.querySelector(`.${this.name} .balls_caught`).textContent =
                        `balls caught ${this.catchCounter}`;
                }
            }
        }
    }
}

// ------------------------------------------
// -----------  EnemyBall class -------------
// ------------------------------------------

class EnemyBall extends Shape {
    constructor(x, y, velX, velY, size, speed) {
        super(x, y, velX, velY);
        this.size = size;
        this.speed = speed;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'rgb(' + random(0,255) + ',' + random(0,255) + ',' + random(0,255) +')';
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
    update() {
        if (((this.x + this.size) >= width) ||
            ((this.x - this.size) <= 0) ||
            ((this.y + this.size) >= height) ||
            ((this.y - this.size) <= 0)) {
            this.velX = speedFollow(player1, enemyBall1).speedX;
            this.velY = speedFollow(player1, enemyBall1).speedY;
        }


        // if ((this.x + this.size) >= width) {
        //     this.velX = speedFollow(player1, enemyBall1).speedX;
        // }
        //
        // if ((this.x - this.size) <= 0) {
        //     this.velX = speedFollow(player1, enemyBall1).speedX;
        // }
        //
        // if ((this.y + this.size) >= height) {
        //     this.velY = speedFollow(player1, enemyBall1).speedY;
        // }
        //
        // if ((this.y - this.size) <= 0) {
        //     this.velY = speedFollow(player1, enemyBall1).speedY;
        // }
        //
        this.x += this.velX;
        this.y += this.velY;
    }
}

// -----------------------------
// --------  running -----------
// -----------------------------

menuOn();
document.addEventListener('keydown', togglePause);
startBtn.addEventListener('click', function () {
    playPreparation();
    createBalls();
    createPlayer1();
    panelBallsCaught1.textContent = 'balls caught 0';
    panelBallsCaught2.textContent = '';
    allControls = player1.controls;
    if (isPlayer2) {
        player1.x = width * .25;
        createPlayer2();
        panelBallsCaught2.textContent = 'balls caught 0';
        allControls = player1.controls.concat(player2.controls);
    }
    createEnemyBall();
    document.addEventListener('keydown', keyPressed);
    document.addEventListener('keyup', keyReleased);
    loop();
});
menuOnBtn.addEventListener('click', menuOn);
ballsNumberRange.addEventListener('input', showRange);
