var snakeWrap = document.getElementById('snakeWrap');  //游戏地图
snakeWrap.style.height = "600px";
snakeWrap.style.width = "600px";

var tr = 20, //行数
    td = 20, //列数
    sw = parseInt(snakeWrap.style.height)/tr, //方块的宽
    sh = parseInt(snakeWrap.style.width)/td; //方块的高

//方块对象-----------------------------------------------------------
function Square(x,y,classname){
    this.x = x*sw;
    this.y = y*sh;
    this.viewContent = document.createElement('div'); //方块对应的DOM元素
    this.viewContent.className = classname;
}

Square.prototype.create = function(){ //创建方块DOM
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';
    snakeWrap.appendChild(this.viewContent);
}

Square.prototype.remove = function(){
    snakeWrap.removeChild(this.viewContent);
}
//蛇对象-----------------------------------------------------------
var snake = null;

Array.prototype.difference = function(arr){
    var result = new Array();
    var obj = {};
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = 1;
    }
    for (var j = 0; j < this.length; j++) {
        if (!obj[this[j]])
        {
            obj[this[j]] = 1;
            result.push(this[j]);
        }
    }
    return result;
}

function Snake(){
    this.head = null; //蛇头
    this.tail = null; //蛇尾
    this.pos = [];  //蛇身的坐标
    
    
    this.directionNum = {
        left:{
            x: -1,
            y: 0,
            rotate:180
        },
        right:{
            x: 1,
            y: 0,
            rotate:0
        },
        up:{
            x: 0,
            y: -1,
            rotate:-90
        },
        down:{
            x: 0,
            y: 1,
            rotate:90
        }
    };
    this.direction = this.directionNum.right; //蛇走的方向

}

Snake.prototype.init = function(){
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2,0]);

    var snakeBody = new Square(1,0,'snakeBody');
    snakeBody.create();
    this.pos.push([1,0]);

    var snakeTail = new Square(0,0,'snakeBody');
    snakeTail.create();
    this.pos.push([0,0]);
    this.tail = snakeTail;

    snakeHead.next = snakeBody;
    snakeBody.last = snakeHead;
    snakeTail.last = snakeBody;

    
}

Snake.prototype.getNextPos = function(){
    var nextPos = [
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]
    //碰到自己
    var selfcolied = false;
    this.pos.forEach(function(value){
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){
            selfcolied = true;
        }
    })
    if(selfcolied){
        this.strategies.die.call(this);
        return;
    }
    //碰到围墙
    if(nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1){
        this.strategies.die.call(this);
        return;
    }
    //碰到食物
    if(foodPos[0] == nextPos[0] && foodPos[1] == nextPos[1]){
        this.strategies.eat.call(this);
        return;
    }
    //啥也没碰到
    this.strategies.move.call(this);
}

Snake.prototype.strategies = {
    move: function(format){
        var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        this.head.next.last = newBody;
        newBody.create();

        //创建新蛇头
        var newHead = new Square(this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y,'snakeHead');
        newHead.create();
        this.head.remove();
        newHead.next = newBody;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate('+this.direction.rotate+'deg)';
        

        //更新蛇身坐标
        this.pos.splice(0,0,[this.head.x/sw + this.direction.x,this.head.y/sh + this.direction.y])
        this.head = newHead;
        
        if(!format){         
            this.tail.remove();
            this.tail = this.tail.last;            
            this.pos.pop();           
        }

    },
    eat: function(){
        food.remove();
        this.strategies.move.call(this,true);
        game.score++;
        createFood();
        
    },
    die: function(){
        game.over();
    }
}
//食物对象-----------------------------------------------------------
var space = null,
    food = null,
    foodPos = [];

function createFood(){
    space = game.land.difference(snake.pos);  //除蛇所在方块之外的地面方块所成的数组
    
    if(space != 0){
        foodPos = space[Math.floor(Math.random()*space.length)];
        food = new Square(foodPos[0],foodPos[1],'food');
        food.create();
    }else{
        
        game.over();
    }
}

//游戏对象-----------------------------------------------------------
var game = null;

function Game(){
    this.timer = null;
    this.score = 0; 
    this.land = [];  //地面(蛇能走的所有方块)
}

Game.prototype.init = function(){
    for(var i = 0; i < tr; i++){  //初始化地面
        for(var j = 0; j < td; j++){
            this.land.push([i,j]);
        }
    }
    snake = new Snake();
    snake.init();
    createFood();
    document.onkeydown = function(ev){
        if(snake.pos[0][1] != snake.pos[1][1]){
            if(ev.code == "ArrowLeft" || ev.code == "KeyA"){
                snake.direction = snake.directionNum.left;
            }else if(ev.code == "ArrowRight" || ev.code == "KeyD"){
                snake.direction = snake.directionNum.right;
            }
        }
        else if(snake.pos[0][0] != snake.pos[1][0]){
            if(ev.code == "ArrowUp" || ev.code == "KeyW"){
                snake.direction = snake.directionNum.up;
            }else if(ev.code == "ArrowDown" || ev.code == "KeyS"){
                snake.direction = snake.directionNum.down;
            }
        }
        if(ev.code == "Space"){
            if(pauseBtn.parentNode.style.display == "" || pauseBtn.parentNode.style.display == "none"){
                game.pause();
                pauseBtn.parentNode.style.display = 'block';
            }else{
                game.start();
                pauseBtn.parentNode.style.display = 'none';
            }
            
        }
    }

    this.start();
}

Game.prototype.start = function(){
    this.timer = setInterval(() => {
        snake.getNextPos();
    },200);
}

Game.prototype.pause = function(){
    clearInterval(this.timer);
}


Game.prototype.over = function(){
    this.pause();
    var i = 6;
    snakeWrap.onclick = "";
    if(space != 0){
        var int = setInterval(() => {
            if(i--){
                if(i % 2){
                    snake.head.remove();
                }else{
                    snake.head.create();
                }
            }else{
                clearInterval(int);
            }
        }, 150);

        setTimeout("overCurtain.children[1].innerHTML = '游戏结束！点击游戏内任意位置或按任意键重新开始';"+
                "overCurtain.children[0].childNodes[2].data = game.score;"+
                "overCurtain.style.display = 'block';"+
                "document.onkeydown = overCurtain.onclick;",
                1000);
    }else{
        setTimeout("overCurtain.children[1].innerHTML = '你赢了！点击游戏内任意位置或按任意键重新开始';"+
                "overCurtain.children[0].childNodes[2].data = game.score;"+
                "overCurtain.style.display = 'block';"+
                "document.onkeydown = snakeWrap.onclick;",
                500);
    }
    
    
}

//按钮---------------------------------------------------------------
var startBtn = document.querySelector('.startBtn button'),
    pauseBtn = document.querySelector('.pauseBtn button'),
    overCurtain = document.querySelector('.gameOver');
//开始游戏
startBtn.onclick = function(){
    startBtn.parentNode.style.display = 'none';
    game = new Game();
    game.init();
}
//暂定游戏
snakeWrap.onclick = function(){
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}
//继续游戏
pauseBtn.onclick = function(){
    game.start();
    pauseBtn.parentNode.style.display = 'none';
}
//结束游戏
overCurtain.onclick = function(){
    overCurtain.style.display = 'none';
    snakeWrap.innerHTML = '';
    game = new Game();
    startBtn.parentNode.style.display = 'block';
}
//---------------------------------------------------------------