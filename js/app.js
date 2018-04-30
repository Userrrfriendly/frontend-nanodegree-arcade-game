/*********************************************************
 *Generic Game Element (building block for game elements)*
 *********************************************************/
var GameElement = function(x=-101, y=-101, sprite) {
    //default values position it offscreen
    this.x = x;
    this.y = y;
    this.sprite = sprite;
}

GameElement.prototype.area = function (left = 20, right = 81, top = 70, bottom = 151) {
    //area is used to check object collision
    //since the original image is 101 * 171px 
    //and is mostly white/invisible space around the character
    //10px where subtracted from left and right,
    //70px from top and 20 from bottom
    //player/princess/GameElement(instance): pure dimensions height=81 width:81
    return {
        left: this.x + left,
        right: this.x + right,
        top: this.y + top,
        bottom: this.y + bottom
    };
};

GameElement.prototype.render = function () {
    //if the element has a property with the name animation
    //the animation.aniFunc will handle the render method
    //if the object doesn't have an animation property
    //default rendering method will be used.
    if (this.animation) {
        this.animation.aniFunc();
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

/*********************************************************
 *************Enemies (bugs) our player must avoid********
 *********************************************************/
var Enemy = function () {
    this.x = -100;
    this.y = 65;
    this.speed = this.getRndInteger(200, 500);
    this.sprite = 'images/enemy-bug.png';
};

Enemy.prototype.update = function (dt) {
    this.x += this.speed * dt;
    if (this.x > 604) {
        this.reset();
    }

    function intersectRect(r1, r2) {
        if (!((r2.left > r1.right) ||
                (r2.right < r1.left) ||
                (r2.top > r1.bottom) ||
                (r2.bottom < r1.top))) {
            console.log('COLLISSION!!!!!...MY MISSIOOOON!!!!!!!');
            document.querySelector('canvas').classList.add('animated', 'wobble');
            player.canMove = false;
            setTimeout(reset, 1000);
        };
    };
    intersectRect(player.area(), this.area());
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
    this.x = -100;
    this.y = 65 + this.getRndInteger(0, 2) * 83;
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

function reset() {
    //resets the game by:
    //1)reposition the player in the grass
    //2)Player is able to move again
    document.querySelector('canvas').classList.remove('animated', 'wobble');
    player.x = 202;
    player.y = 397;
    player.canMove = true;
}

/*********************************************************
 **********  Instances of Player,Enemy,GameElement *******
 *********************************************************/

// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let player = new Player();

let bug1 = new Enemy;
let bug2 = new Enemy;
let bug3 = new Enemy;
let testBug = new Enemy;
testBug.speed = 0;
testBug.x = 202;


bug1.y = 68;
bug2.y = 68 + 83;
bug3.y = 68 + 83 * 2;
let allEnemies = [];
allEnemies.push(new Enemy, new Enemy, bug1, bug2, bug3);

//************************** PRINCESS **********************************
//Since the princes is drowning in the water and surrounded by ravenous bugs
//she is clearly .DISTRESSED! While distressed she constantly .SCREAMS()
//when our hero reaches the water she stops beeing distressed and the heart appears on the screen 
let princess = new GameElement(202,-18,'images/char-princess-girl.png');
princess.distressed = true;
princess.screamText = {
    size : 20,
    increment : true,
    message : ['HELP!!!','PLEASE HELP!', 'I CAN\'T SWIM!', 'SAVE ME!','I\'M DROWNING!', 'AAAaaa', '!@#$%^&*'],
};

princess.update = function(dt) {
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

princess.scream = function() {
    let font =  this.screamText;
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

//****************** HEART ******************************
const heart = new GameElement(101,-18,'images/Heart.png');
heart.update = function(dt) {
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

heart.animation = {
    decrement: true,
    dWidth: 101,
    dHeight: 171,
    aniFunc: function () {
        // console.log(this);
        var animation = heart.animation; //what should i do if i wanted to call it with this.animation?
        ctx.drawImage(Resources.get(heart.sprite), heart.x, heart.y, animation.dWidth, animation.dHeight);
        if (animation.decrement) {
            animation.dWidth -= 1;
            animation.dHeight -= 1;
            heart.x += 0.5;
            heart.y += 1;
            if (animation.dWidth <= 50) {animation.decrement = false;}
        } else {
            animation.dWidth += 1;
            animation.dHeight += 1;
            heart.x -= 0.5;
            heart.y -= 1;
            if (animation.dWidth >= 101) {animation.decrement = true;}
        }
    }
}

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

function victory() {
    // document.querySelector('.victory-screen').classList.remove('hidden');
    // document.querySelector('.victory-screen').classList.add('bounceInDown', 'translateY');
    showPanel();
    player.canMove = false;
}

//hides the Game panel (bounceOutUp)
function hidePanel() {
    document.querySelector('.victory-screen').classList.add('bounceOutUp');
    setTimeout( function () {
        document.querySelector('canvas').classList.add('no-margin');
        document.querySelector('.victory-screen').className = 'victory-screen animated translateY'
    }, 500)
}

//Shows the GamePanel (bounceInDown)
function showPanel() {
    document.querySelector('canvas').classList.remove('no-margin');
    document.querySelector('.victory-screen').classList.remove('translateY');
    document.querySelector('.victory-screen').classList.add('bounceInDown');

}

function debugBug() {
    //NOT A GAME FUNCTION! Used only in debbuging mode!
    //clears the enemies and leaves only one bug(testBug) on the screen
    allEnemies = [];
    allEnemies.push(testBug);
}

/*TODO: 
    *DEFAULT ENEMY.XY SHOULD BE SET BY THE CANVAS SIZE
    *Prevent the player from moving after death for 900ms
    *easy normal hard
    *FIX THE FONT ON SCREAM()
    *RESET GAME (RESET HEART XY, PRINCESS XY, ANIMATIONS victory-screen)
    *WHEN YOU CREATE THE CANVAS ALSO CREATE THE VICTORY SCREEN SO THEY HAVE THE SAME SIZE
        *IF CANVAS IS CHANGED THE XY OF PLAYER/HEART/PRINCES ARE FROM THE OLD INSTANCE...NEED TO UPDATE :()
height * width 
101 * 83
stopThe bug that killed the player. but how will you reset him?
*/

