// Enemies our player must avoid
//enemies have 3 difficulties(levels) easy normal hard
var Enemy = function(level) {
    this.x = -100;
    this.y = 68;
    this.speed = this.getRndInteger(200,500);
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};
//504x = out of bounds
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
// You should multiply any movement by the dt parameter
// which will ensure the game runs at the same speed for
// all computers.
Enemy.prototype.update = function(dt) {
    //once the enemy is outside the canvas its reset() triggers
    this.x += this.speed * dt;
    if (this.x > 604) {this.reset();}
};

Enemy.prototype.reset = function() {
    //repositions the enemy on a random row on the left side of the canvas
    //gives the enemy a random speed
    this.x = 0;
    this.y = 68 + this.getRndInteger(0,2) * 83;
    this.speed = this.getRndInteger(100,350);
}
// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.getRndInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

/*
Test Code
*/
let bug1 = new Enemy;
let bug2 = new Enemy;
let bug3 = new Enemy;
bug1.y = 68;
bug2.y = 68 + 83;
bug3.y = 68 + 83 *2;
let allEnemies = [];
allEnemies.push(new Enemy, new Enemy, bug1, bug2, bug3);

// The player class requires an update(), render() and
// a handleInput() method.

var Player = function() {
    // this.x = 202 +  101;
    // this.y = 566;  //100 * 4 + 83;
    //7*8 canvas
    this.x = 202;
    this.y = 400; 
    this.sprite = 'images/char-boy.png';
};

Player.prototype.update = function() {

};

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(key) {
    //0 < x < canvas.width -101
    //0 < y < canvas.height - 141
    switch (key) {
        case 'up':
            if (this.y > -15) {this.y -= 83;}
            break;
        case 'down':
            if (this.y < 400) {this.y += 83;}
            break;
        case 'left':
            if (this.x > 0) {this.x -= 101};
            break;
        case 'right': 
            if (this.x < 404) {this.x += 101};
            break;
    }
    console.log('x: ' + this.x + ' y: ' + this.y);
}; 

let player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

/*TODO: Implement game.reset() in engine.js
make 3 difficulties * easy, normal, hard


*/