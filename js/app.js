/*********************************************************
 *Generic Game Element (building block for game elements)*
 *********************************************************/
class GameElement {
    constructor(x = -101, y = -101, sprite) {
        //default values position it offscreen
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.spriteExtents = {
            left: 20,
            right: 81,
            top: 70,
            bottom: 150
        };
    }

    area() {
        //area is used to check object collision.
        //Each cell on the canvas is 101 x 83 pixels but the original image is 101 * 171px 
        //the extra space is the white(invisible when rendered) space around the character
        //20px where subtracted from left and right,
        //70px from top and 20 from bottom
        //Default gameElement dimensions after 'trimming' the whitespace are height=61 width:80
        return {
            left: this.x + this.spriteExtents.left,
            right: this.x + this.spriteExtents.right,
            top: this.y + this.spriteExtents.top,
            bottom: this.y + this.spriteExtents.bottom
        };
    }

    render() {
        //if the element has a property with the name animation then
        //the gameElement.animation.animatedRender() will handle the render method
        //if not then default rendering method will be used.
        if (this.animation) {
            this.animation.animatedRender();
        } else {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    }

    getRndInteger(min, max) {
        //returns a random integer between (and including) the given min max values
        //used to randomly position and set random speed to each instance 
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

/*********************************************************
 *************Enemies (bugs) our player must avoid********
 *********************************************************/

//Unless x,y,speed are specified, by default instanses of Enemy
//will be positioned outside of the left side of the canvas
//on a random row and given a random speed.
class Enemy extends GameElement {
    constructor(x = -101, y = 65, sprite = 'images/enemy-bug.png', speed) {
        super(x, y, sprite);
        speed ? this.speed = speed : this.speed = this.getRndInteger(200, 500);
        this.spriteExtents = {
            left: 0,
            right: 100,
            top: 80,
            bottom: 148
        };
    }

    /*
        Enemy.update takes care of the following:
        -1- sets enemy speed based on timestamp(dt) difference provided by the engine.js
        -2- checks if enemy is outside the canvas and either places it on the left side of the canvas (during gameplay)
            or stops the movement and leaves the enemies outside of the right side of canvas (during victory).
        -3- checks for collision with the player.
    */
    update(dt) {
        this.x += this.speed * dt;
        if (this.x > 604) {
            gameStatus.status === 'running' ? this.reset() : this.speed = 0;
        }
        const thisEnemy = this;
        //intersectRect checks if two rectangles(enemy sprite vs player sprite) overlap 
        function intersectRect(r1, r2) {
            //if player cannotMove then don't check for collision 
            //among others this prevents triggering collision multiple times that would also trigger the setTimeout multiple times.
            if (player.canMove) {
                if (!((r2.left > r1.right) ||
                        (r2.right < r1.left) ||
                        (r2.top > r1.bottom) ||
                        (r2.bottom < r1.top))) {
                    //COLLISSION!
                    //  -the collided bug stops
                    //  -the canvas wobbles
                    //  -player is immobillized
                    //  -after 1000ms the player the bug and the canvas are reseted.
                    thisEnemy.speed = 0;
                    document.querySelector('canvas').classList.add('animated', 'wobble');
                    player.canMove = false;
                    setTimeout(function () {
                        thisEnemy.reset();
                        player.reset();
                        document.querySelector('canvas').classList.remove('wobble');
                    }, 1000);
                };
            };
        };
        intersectRect(player.area(), this.area());
    }

    //repositions the enemy on a random row on the left side of the canvas
    //and gives the enemy a random speed
    reset(x = -100, y = 65 + this.getRndInteger(0, 2) * 83, speed = this.getRndInteger(100, 350)) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

}


/*********************************************************
 ***********************  Player *************************
 *********************************************************/
class Player extends GameElement {
    constructor(x = 202, y = 397, sprite = 'images/char-boy.png') {
        super(x, y, sprite);
        this.canMove = true;
    }

    //Handles the keyboard input(arrows) Checks if the player can move, and moves the player accordingly
    //also checks if player has reached the water (victory condition).
    handleInput(key) {
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
            // console.log('x: ' + this.x + ' y: ' + this.y);
        };
    };

    update() {
        //will add functionality later when hard difficulty is implemented
    }

    //Repositions the player on the starting position
    //and allows him able to move again.
    reset(x = 202, y = 397) {
        this.x = x;
        this.y = y;
        this.canMove = true;
    }
}

/*********************************************************
 ***********************  Princess ***********************
 *********************************************************/
/*
    Since the princes is drowning in the water and surrounded by ravenous bugs
    she is clearly .DISTRESSED! While distressed she constantly .SCREAMS() for help
    when our hero reaches the water she stops beeing distressed,
    stops screaming and gives her heart to the player. (beating heart appears next to her). 
*/
class Princess extends GameElement {
    constructor(x = 202, y = -18, sprite = 'images/char-princess-girl.png') {
        super(x, y, sprite);
        this.distressed = true;
        this.screamText = {
            size: 20,
            increment: true,
            message: ['HELP!!!', 'PLEASE HELP!', 'I CAN\'T SWIM!', 'SAVE ME!', 'I\'M DROWNING!', 'AaAaaaA!', '!@#$%^&*'],
        };
    }

    //checks if player has reached the water 
    //checks if the player overlaps with her 
    //(she will move to the next square to avoid overlaping with player)
    update(dt) {
        if (player.y <= -18) {
            this.distressed = false;
        }
        const thisPrincess = this;

        function intersectRect(r1, r2) {
            if (!((r2.left > r1.right) ||
                    (r2.right < r1.left) ||
                    (r2.top > r1.bottom) ||
                    (r2.bottom < r1.top))) {
                thisPrincess.x += 101;
            }
        }
        intersectRect(player.area(), this.area());
    }

    //Prints animated text (screams for help) on the canvas 
    //Since this method is used to render content on the
    //canvas it is invoked in the render() method in engine.js
    scream() {
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
    }

    reset() {
        this.x = 202;
        this.y = -18;
        this.distressed = true;
    }
}

/*********************************************************
 ***********************  Heart **************************
 *********************************************************/
//heart is drawn on the canvas when princess stops beeing distressed (on victory condition)
class Heart extends GameElement {
    constructor(x = 101, y = -18, sprite = 'images/Heart.png') {
        super(x, y, sprite);
        //animation keeps track of all the values nessesary for the animation
        //the existance of this property 'tells' the render method to  
        //override the default render and instead use the animatedRender() method to render the object
        //  heart is rendered/animated similary to princess's screams(text)
        //  At each frame the image is repositioned by dx=0.5px, dy=1px and at the same time scaled (initially down then up)
        //  by 1px along the x & y axis. When width reached a certain (min or max) threshold the process is reversed.
        //  thus giving the impression that the heart is beating.
        this.animation = {
            decrement: true,
            dWidth: 101,
            dHeight: 171,
            thisHeart: this,
            animatedRender: function () {
                ctx.drawImage(Resources.get(this.thisHeart.sprite), this.thisHeart.x, this.thisHeart.y, this.dWidth, this.dHeight);
                if (this.decrement) {
                    this.dWidth -= 1;
                    this.dHeight -= 1;
                    this.thisHeart.x += 0.5;
                    this.thisHeart.y += 1;
                    if (this.dWidth <= 50) {
                        this.decrement = false;
                    }
                } else {
                    this.dWidth += 1;
                    this.dHeight += 1;
                    this.thisHeart.x -= 0.5;
                    this.thisHeart.y -= 1;
                    if (this.dWidth >= 101) {
                        this.decrement = true;
                    }
                }
            }
        }
    }

    //Moves the heart if the player intersects with it.
    update(dt) {
        const thisHeart = this;

        function intersectRect(r1, r2) {
            if (!((r2.left > r1.right) ||
                    (r2.right < r1.left) ||
                    (r2.top > r1.bottom) ||
                    (r2.bottom < r1.top))) {
                thisHeart.x += 202;
            }
        }
        intersectRect(player.area(), this.area());
    }

    reset() {
        this.x = 101;
        this.y = -18;
        this.animation.decrement = true;
        this.animation.dWidth = 101;
        this.animation.dHeight = 171;
    }

}

/*********************************************************
 **********  Instances of Player,Enemy,GameElement *******
 *********************************************************/

// Place the player object in a variable called player
let player = new Player();
// Place all enemy objects in an array called allEnemies
let allEnemies = [];
allEnemies.push(new Enemy(), new Enemy(), new Enemy(-101, 65), new Enemy(-101, 148), new Enemy(-101, 231));
const princess = new Princess();
const heart = new Heart();

// This listens for key presses and sends the keys to your
// player.handleInput() method.
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

//Victory() is triggered when player reaches the water
//It brings down the GamePanel and changes the state to 'game-over'
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
    }, 600)
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
    player.reset();
    princess.reset();
    heart.reset();
})

function debugBug() {
    //NOT A GAME FUNCTION! Used only in debbuging mode in devtools!
    //clears the enemies and leaves only one bug (testBug) on the screen
    let testBug = new Enemy();
    testBug.speed = 0;
    testBug.x = 202;
    allEnemies = [];
    allEnemies.push(testBug);
    this.testBug = testBug;
}

/*TODO: 
    *Add HARD difficulty:
        -Modify enjine.js so it can generate a bigger canvas for hard mode
        -Add detailed comments for changes in enine.js
        -Default enemy.y/victory condition/starting position for the player/game panel width etc
            SHOULD be set dynamically (depending on the canvas size)
        -Add stones to the grid (obstacles where the player cannot pass through)
        -Add collectable items 
*/