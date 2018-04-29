var GameElement = function(x=-101, y=-101, sprite) {
    //default values position it offscreen
    this.x = x;
    this.y = y;
    this.sprite = sprite;
}
// Enemies our player must avoid
//enemies have 3 difficulties(levels) easy normal hard
var Enemy = function (level) {
    this.x = -100;
    this.y = 68;
    // this.areaX = this.x + 101;
    // this.areaY = this.y + 83;
    this.speed = this.getRndInteger(200, 500);
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
Enemy.prototype.update = function (dt) {
    //once the enemy is outside the canvas its reset() triggers
    this.x += this.speed * dt;
    if (this.x > 604) {
        this.reset();
    }
    let enemyArea = this.area();
    let playerArea = player.area();

    function intersectRect(r1, r2) {
        if (!((r2.left > r1.right) ||
                (r2.right < r1.left) ||
                (r2.top > r1.bottom) ||
                (r2.bottom < r1.top))) {
            console.log('COLLISSION!!!!!...MY MISSIOOOON!!!!!!!');
            document.querySelector('canvas').classList.add('animated', 'wobble');
            player.canMove = false;
            (function delayReset() {
                timeoutID = window.setTimeout(reset, 1000);
            })();
        };
        // return !(r2.left > r1.right ||
        //     r2.right < r1.left ||
        //     r2.top > r1.bottom ||
        //     r2.bottom < r1.top);
    };
    intersectRect(playerArea, enemyArea);

};

Enemy.prototype.area = function () {
    return {
        left: this.x,
        right: this.x + 100,
        top: this.y + 70,
        bottom: this.y + 148
    };
};


Enemy.prototype.reset = function () {
    //repositions the enemy on a random row on the left side of the canvas
    //gives the enemy a random speed
    this.x = 0;
    this.y = 68 + this.getRndInteger(0, 2) * 83;
    this.speed = this.getRndInteger(100, 350);
}
// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.getRndInteger = function (min, max) {
    //returns a random integer between (and including) the given min max values
    //used to randomly position and set random speed to each bug 
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


// The player class requires an update(), render() and
// a handleInput() method.

var Player = function () {
    // this.x = 202 +  101;
    // this.y = 566;  //100 * 4 + 83;
    //7*8 canvas
    this.canMove = true;
    this.x = 202;
    this.y = 397; //400; 
    this.areaX = this.x + 101;
    this.areaY = this.y + 83;
    this.sprite = 'images/char-boy.png';
};

Player.prototype.area = function () {
    //area is defined in the following way:
    //since the original image is 101 * 171px 
    //and is mostly white/invisible space around the character
    //10px where subtracted from left and right,
    //70px from top and 20 from bottom
    //player: height=81, width:81
    return {
        left: this.x + 10,
        right: this.x + 91,
        top: this.y + 70,
        bottom: this.y + 151
    };
};


Player.prototype.update = function () {

};

// Draw the player on the screen
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function (key) {
    //0 < x < canvas.width -101
    //0 < y < canvas.height - 141
    if (!this.canMove) {
        return;
    };
    switch (key) {
        case 'up':
            if (this.y > -15) {
                this.y -= 83;
            }
            break;
        case 'down':
            if (this.y < 397) {
                this.y += 83;
            }
            break;
        case 'left':
            if (this.x > 0) {
                this.x -= 101
            };
            break;
        case 'right':
            if (this.x < 404) {
                this.x += 101
            };
            break;
    }
    console.log('x: ' + this.x + ' y: ' + this.y);
};

function reset() {
    document.querySelector('canvas').classList.remove('animated', 'wobble');
    player.x = 202;
    player.y = 397;
    player.canMove = true;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

let player = new Player();
/***********Princess******************/
let princess = new Player();
princess.sprite = 'images/char-princess-girl.png';
princess.x = 202;
princess.y = -18;
princess.speed = 1;
princess.distressed = true;
princess.text = {
    size : 20,
    increment : true,
    message : ['HELP!!!','PLEASE HELP!', 'I CAN\'T SWIM!', 'SAVE ME!', 'AAAAAA', '!@#$%^&*'],
};

princess.update = function(dt) {
    // this.scream();
    // this.text.size += this.speed * dt; 
    if (player.y <= -18) {
        this.distressed = false;
    }
    let playerArea = player.area();
    let princessArea = princess.area();
    function intersectRect(r1, r2) {
        if (!((r2.left > r1.right) ||
                (r2.right < r1.left) ||
                (r2.top > r1.bottom) ||
                (r2.bottom < r1.top))) {
            player.canMove = false;
            princess.x += 101;
        };
    };
    intersectRect(playerArea, princessArea);
};

princess.scream = function() {
    let font =  this.text;
    // console.log(font);
    ctx.font = font.size + 'px serif';
    ctx.fillText(font.message[0] , 300, 100);
    if (font.increment) {
        font.size += 0.1;
        if (font.size >= 30) {font.increment = false};
    } else {
        font.size -= 0.1;
        if (font.size <= 20) {
            font.increment = true;
            let temp = font.message.shift(); //remove the first element of the message array
            font.message.push(temp); //the first message is now last item in the array
        }
    }
};
/*********** END OF - Princess ELEMENT******************/
let bug1 = new Enemy;
let bug2 = new Enemy;
let bug3 = new Enemy;

let testBug = new Enemy;
testBug.speed = 0;
testBug.x = 202;

function debugBug() {
    allEnemies = [];
    allEnemies.push(testBug);
}
bug1.y = 68;
bug2.y = 68 + 83;
bug3.y = 68 + 83 * 2;
let allEnemies = [];
allEnemies.push(new Enemy, new Enemy, bug1, bug2, bug3);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
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
height * width 
101 * 83
stopThe bug that killed the player. but how will you reset him?
create a reward for beating the game 
Prevent the player from moving after death for 900ms

[x: 0, 100] -> [x: 101, 201]  
[y: 0, 82] - > [y: 0, 82] 
 |
 V
[x: 0, 100] ->  [x: 101, 201]  
[y: 83, 165] - > [y: 83, 165] 
*/