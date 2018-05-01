/*********************************************************
 *Generic Game Element (building block for game elements)*
 *********************************************************/
var GameElement = function (x = -101, y = -101, sprite) {
    //default values position it offscreen
    this.x = x;
    this.y = y;
    this.sprite = sprite;
}

GameElement.prototype.area = function (left = 20, right = 81, top = 70, bottom = 150) {
    //area is used to check object collision.
    //Each cell on the canvas is 101 x 83 pixels but the original image is 101 * 171px 
    //the extra space is the white(invisible when rendered) space around the character
    //20px where subtracted from left and right,
    //70px from top and 20 from bottom
    //player/princess/gameElement: dimensions after 'trimming' the whitespace are height=61 width:80

    return {
        left: this.x + left,
        right: this.x + right,
        top: this.y + top,
        bottom: this.y + bottom
    };
};

GameElement.prototype.render = function () {
    //if the element has a property with the name animation then
    //the gameElement.animation.aniFunc() will handle the render method
    //if not then default rendering method will be used.
    if (this.animation) {
        this.animation.aniFunc();
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

/*********************************************************
 *************Enemies (bugs) our player must avoid********
 *********************************************************/

//Unless x,y,speed are specified, by default instanses of Enemy
//will be positioned outside of the left side of the canvas
//in a random row, and will get a random speed.
var Enemy = function (x = -100, y = 65, speed = this.getRndInteger(200, 500)) {
    this.x = x;
    this.y = y;
    this.speed = speed; //this.getRndInteger(200, 500);
    this.sprite = 'images/enemy-bug.png';
};

/*
Enemy.update takes care of the following:
-1- sets enemy speed based on timestamp(dt) difference provided by the engine.js
-2- checks if enemy is outside the canvas and either places it on the left side of the canvas (during gameplay)
    or stops the movement and leaves the enemies outside of the right side of canvas (during victory).
-3- checks for collision with the player.
*/
Enemy.prototype.update = function (dt) {
    this.x += this.speed * dt;
    if (this.x > 604) {
        (gameStatus.status === 'running') ? this.reset() : this.speed = 0;
    }
    let thisEnemy = this;
    //intersectRect checks if two rectangles(enemy sprite vs player sprite) overlap 
    function intersectRect(r1, r2) {
        //if player cannotMove then don't check for collision 
        //this prevents triggering collision multiple times that would also trigger the setTimeout multiple times.
        if (player.canMove) { 
            if (!((r2.left > r1.right) ||
                    (r2.right < r1.left) ||
                    (r2.top > r1.bottom) ||
                    (r2.bottom < r1.top))) {
                // console.log('COLLISSION!!!!!...MY MISSIOOOON!!!!!!!' + this);
                thisEnemy.speed = 0;
                document.querySelector('canvas').classList.add('animated', 'wobble');
                player.canMove = false;
                setTimeout(function() {
                    thisEnemy.reset();
                    player.reset();
                    document.querySelector('canvas').classList.remove('wobble');
                }, 1000);
            };
        };
    };
    intersectRect(player.area(), this.area());
};

Enemy.prototype.area = function () {
    return {
        left: this.x,
        right: this.x + 100,
        top: this.y + 80,
        bottom: this.y + 148
    };
};

//repositions the enemy on a random row on the left side of the canvas
//and gives the enemy a random speed
Enemy.prototype.reset = function (speed) {
    this.x = -100;
    this.y = 65 + this.getRndInteger(0, 2) * 83;
    this.speed = this.getRndInteger(100, 350);
}

// Draw the enemy on the screen (single static frame)
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//returns a random integer between (and including) the given min max values
//used to randomly position and set random speed to each instance 
Enemy.prototype.getRndInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*********************************************************
 ***********************  Player *************************
 *********************************************************/
var Player = function () {
    this.canMove = true;
    this.x = 202;
    this.y = 397; //400; 
    // this.areaX = this.x + 101;
    // this.areaY = this.y + 83;
    this.sprite = 'images/char-boy.png';
};

Player.prototype.area = function () {
    return {
        left: this.x + 20,
        right: this.x + 81,
        top: this.y + 70,
        bottom: this.y + 150
    };
};

Player.prototype.update = function () {

};

// Draw the player on the screen
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Handles the keyboard input(arrows) after checking if player is able(or rather allowed) to move,
//also checks if player has reached the water (victory condition).
Player.prototype.handleInput = function (key) {
    if (this.canMove) {
        switch (key) {
            case 'up':
                if (this.y > -18) {
                    this.y -= 83;
                    if (this.y <= -18) {
                        victory();
                    }
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
};

//Repositions the player on the starting position
//and allows him able to move again.
Player.prototype.reset = function () {
    player.x = 202;
    player.y = 397;
    player.canMove = true;
}

/*********************************************************
 **********  Instances of Player,Enemy,GameElement *******
 *********************************************************/

// Place the player object in a variable called player
let player = new Player();

// Place all enemy objects in an array called allEnemies
let bug1 = new Enemy;
let bug2 = new Enemy;
let bug3 = new Enemy;
bug1.y = 65;
bug2.y = 65 + 83;
bug3.y = 65 + 83 * 2;
let allEnemies = [];
allEnemies.push(new Enemy(), new Enemy(), bug1, bug2, bug3);

/************************** PRINCESS **********************************
    Since the princes is drowning in the water and surrounded by ravenous bugs
    she is clearly .DISTRESSED! While distressed she constantly .SCREAMS() for help
    when our hero reaches the water she stops beeing distressed,
    stops screaming and gives her heart to the player. (beating heart appears next to her). 
*/
let princess = new GameElement(202, -18, 'images/char-princess-girl.png');
princess.distressed = true;
princess.screamText = {
    size: 20,
    increment: true,
    message: ['HELP!!!', 'PLEASE HELP!', 'I CAN\'T SWIM!', 'SAVE ME!', 'I\'M DROWNING!', 'AaAaaaA!', '!@#$%^&*'],
};

//checks if player has reached the water 
//checks if the player overlaps with her 
//(she will move to the next square to avoid overlap with player)
princess.update = function (dt) {
    if (player.y <= -18) {
        this.distressed = false;
    }

    function intersectRect(r1, r2) {
        if (!((r2.left > r1.right) ||
                (r2.right < r1.left) ||
                (r2.top > r1.bottom) ||
                (r2.bottom < r1.top))) {
            player.canMove = false;
            princess.x += 101;
        };
    };
    intersectRect(player.area(), princess.area());
};

//Prints animated text (princess's screams for help) on the canvas 
//Since this method is used to render content on the
//canvas it is invoked in the render() method in engine.js
princess.scream = function () {
    let font = this.screamText;
    ctx.font = font.size + 'px fantasy, Cursive';
    ctx.fillText(font.message[0], 300, 100);
    if (font.increment) {
        font.size += 0.1;
        if (font.size >= 30) {
            font.increment = false
        };
    } else {
        font.size -= 0.1;
        if (font.size <= 20) {
            font.increment = true;
            let temp = font.message.shift(); //remove the first element of the message array
            font.message.push(temp); //the first message is now last item in the array
        }
    }
};

princess.reset = function() {
    this.x =202;
    this.y =-18;
    this.distressed = true;
}

//****************** HEART ******************************
//heart is drawn on the canvas when princess stops beeing distressed (on victory condition)
//heart is rendered similary to princess's screams(text)
//At each frame the image is repositioned by dx=1px, dy=1px and at the same time scaled down by 
//1px along the x & y axis thus giving the impression that the heart is beating.  
const heart = new GameElement(101, -18, 'images/Heart.png');
//Moves the heart if the player intersects with it.
heart.update = function (dt) {
    function intersectRect(r1, r2) {
        if (!((r2.left > r1.right) ||
                (r2.right < r1.left) ||
                (r2.top > r1.bottom) ||
                (r2.bottom < r1.top))) {
            heart.x += 202;
        };
    };
    intersectRect(player.area(), heart.area());
};

//Keeps track of all the values nessesary for the animation
//the existance of this property 'tells' the render method(of this object) to  
//override the default render and instead use the aniFunk() method to render the object
heart.animation = {
    decrement: true,
    dWidth: 101,
    dHeight: 171,
    aniFunc: function () {
        // console.log(this); ...window
        var animation = heart.animation; //what should i do if i wanted to call it with this.animation?
        ctx.drawImage(Resources.get(heart.sprite), heart.x, heart.y, animation.dWidth, animation.dHeight);
        if (animation.decrement) {
            animation.dWidth -= 1;
            animation.dHeight -= 1;
            heart.x += 0.5;
            heart.y += 1;
            if (animation.dWidth <= 50) {
                animation.decrement = false;
            }
        } else {
            animation.dWidth += 1;
            animation.dHeight += 1;
            heart.x -= 0.5;
            heart.y -= 1;
            if (animation.dWidth >= 101) {
                animation.decrement = true;
            }
        }
    }
}

heart.reset = function () {
    this.x = 101;
    this.y = -18;
    this.animation.decrement = true;
    this.animation.dWidth = 101;
    this.animation.dHeight = 171;
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        //real gamers don't use arrows! A,W,D,S keys: 
        65: 'left',
        87: 'up',
        68: 'right',
        83: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

//Is triggered when player reaches the water
//brings down the GamePanel and changes the state to 'game-over'
function victory() {
    player.canMove = false;
    showPanel();
    gameStatus.status = 'game-over';
}

//hides the GamePanel (bounceOutUp)
function hidePanel() {
    document.querySelector('.victory-screen').classList.add('bounceOutUp');
    setTimeout(function () {
        document.querySelector('canvas').classList.add('no-margin');
        document.querySelector('.victory-screen').className = 'victory-screen animated translateY';
    }, 500)
}

//Shows the GamePanel (bounceInDown)
function showPanel() {
    document.querySelector('canvas').classList.remove('no-margin');
    document.querySelector('.victory-screen').firstElementChild.textContent = `Congrats! The Hero Saves The Day!
    Play Again?`;
    document.querySelector('.victory-screen').classList.remove('translateY');
    document.querySelector('.victory-screen').classList.add('bounceInDown');
}

//Normal-difficulty Event Listener - Starts the game in normal mode.
//sets the state to 'runnng' (game in progress)
document.querySelector('.normal').addEventListener('click', function () {
    gameStatus.status = 'running';
    hidePanel();
    player.reset(); //player reset
    princess.reset();
    heart.reset();
})

function debugBug() {
    //NOT A GAME FUNCTION! Used only in debbuging mode!
    //clears the enemies and leaves only one bug (testBug) on the screen
    let testBug = new Enemy();
    testBug.speed = 0;
    testBug.x = 202;
    allEnemies = [];
    allEnemies.push(testBug);
    this.testBug = testBug;
}

/*TODO: 
    *the canvas obj could/should be part of the gameStatus 
    *Wright in comments what you did in the enine.js
    *add WASD keys :P
    *make Enemy consume args and make default values for y positioning.
*****BUT FIRST TAKE CARE OF THE CANVAS SIZE IN HARD MODE!!!!!!!!!!!!!!!!
    *DEFAULT ENEMY.XY SHOULD BE SET BY THE CANVAS SIZE
    *HARD MODE
    *FIX THE FONT ON SCREAM()
    *WHEN YOU CREATE THE CANVAS ALSO CREATE THE VICTORY SCREEN SO THEY HAVE THE SAME SIZE
        *IF CANVAS IS CHANGED THE XY OF PLAYER/HEART/PRINCES ARE FROM THE OLD INSTANCE...NEED TO UPDATE :()
101 * 83
*/