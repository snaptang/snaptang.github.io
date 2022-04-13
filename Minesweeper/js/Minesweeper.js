//初始化游戏难度按钮-----------------------------------------------------------
var btns = document.querySelectorAll('.level button'),
    mine = null;
    ln = 0,
    arr = [[9,9,10],[16,16,40],[28,28,99]];

for(let i = 0; i < btns.length; i++){
    btns[i].onclick = function(){
        btns[ln].className = '';
        btns[i].className = 'active';
        mine = new Mine(...arr[i]);
        ln = i;
    }
}


//雷图对象-----------------------------------------------------------
function Mine(tr,td,mineNum){
    this.tr = tr;  //行数
    this.td = td;  //列数
    this.mineNum = mineNum;  //雷的数量

    this.squares = [];  //方块的信息
    this.tds = [];  //存储所有单元格的DOM
    this.surplusMine = mineNum;  //剩余雷数
    this.uncovSquareNum = this.tr*this.td;  //未被揭开的方块数量

    this.parent = document.querySelector('.gameBox');
    this.init();
}

Mine.prototype.randomNum = function(){  //随机生成雷的坐标
    var square = new Array(this.uncovSquareNum);
    for(var i = 0; i < square.length; i++){
        square[i] = i;
    }
    square.sort(function(){
        return 0.5 - Math.random()
    });
    return square.slice(0,this.mineNum);  //取前this.mineNum个元素作为雷的坐标
}

Mine.prototype.init = function(){
    var rn = this.randomNum();  //雷在雷图里的坐标
    var n = 0;  //用来找到格子对应的索引
    for(var i = 0; i < this.tr; i++){
        this.squares[i] = [];
        for(var j = 0; j < this.td; j++){
            if(rn.indexOf(n++) != -1){
                this.squares[i][j] = {type:'mine', x:i, y:j};
            }else{
                this.squares[i][j] = {type:'number', x:i, y:j, value:0};
            }
        }
    }
    this.parent.oncontextmenu = function(){
        return false;
    }
    this.createDom();
    this.updateNum();


    this.minenumDom = document.querySelector('.info .mineNum');
    this.minenumDom.innerHTML = this.surplusMine;
    this.int;  //用于开始和停止计时器 
    this.timer = 0;  //用于显示计时器的时间
    this.timerDom = document.querySelector('.info .timer');
    this.timeover();  //关闭上一局游戏的计时器
    this.timerDom.innerHTML = 0;
}

Mine.prototype.createDom = function(){
    var table = document.createElement('table');
    var This = this;
    for(var i = 0; i < this.tr; i++){  //行
        var domTr = document.createElement('tr');
        this.tds[i] = [];

        for(var j = 0; j < this.td; j++){  //列
            
            var domTd = document.createElement('td');
            
            domTd.pos = [i,j];  //存下格子坐标


            domTd.onmouseup = function(e){
                if(This.timer == 0){
                    This.timer++;
                    This.timeStart();
                }
                This.play(e,this);
                if(This.uncovSquareNum == This.mineNum){
                    This.gameOver(1);
                }
            }
            
            this.tds[i][j] = domTd;
            domTr.appendChild(domTd);
        }

        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';
    this.parent.appendChild(table);
}

Mine.prototype.getAround = function(square){  //返回包括方块自身在内的方块所在九宫格内不是雷的方块的坐标
    var x = square.x,
        y = square.y,
        num = [],  //附近的数字格子的坐标
        mine = [], //附近的雷格子的坐标
        flag = [];  //附近的棋子的坐标

    for(var i = x-1; i <= x+1; i++){
        for(var j = y-1; j <= y+1; j++){
            if( 0 <= i && i < this.tr && 0 <= j && j < this.td){
                if(this.tds[i][j].className == 'flag'){
                    flag.push([i,j]);
                }else if(this.squares[i][j].type == 'mine'){
                    mine.push([i,j]);
                }else{
                    num.push([i,j]);
                }
            }   
        }
    }

    return [num,mine,flag];
}

Mine.prototype.updateNum = function(){
    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'number'){
                continue;
            }
            var num = this.getAround(this.squares[i][j])[0];
            for(var k = 0; k < num.length; k++){
                this.squares[num[k][0]][num[k][1]].value++;
            }
        }
    }
}

Mine.prototype.timeStart = function(){
    this.int = setInterval(()=>{
        this.timerDom.innerHTML = this.timer++;
    },1000)
}

Mine.prototype.timeover = function(){
    this.int = clearInterval(this.int);
}

var cl = ['zero','one','two','three','four','five','six','seven','eight'];  //简化游戏中指示方块周围雷数量的数字

Mine.prototype.play = function(e,obj){
    if(e.which == 1 || e.which == 3){
        if(e.which == 1 && obj.className != 'flag'){
            var curSquare = this.squares[obj.pos[0]][obj.pos[1]];  //被点击的方块的信息
            if(curSquare.type == 'number' && obj.className == ''){  //未被点开的数字方块
                obj.innerHTML = curSquare.value;
                obj.className = cl[curSquare.value] + ' number';
                this.uncovSquareNum--;
                if(curSquare.value == 0){
                    this.openAround(curSquare);
                }
            }else if(curSquare.type == 'mine'){  //未被点开的雷方块
                this.gameOver(0,obj);
            }else{  //已被点开的数字方块
                this.openAround(curSquare);
            }
        }else if(e.which == 3){
            if((obj.className || this.surplusMine == 0 )&& obj.className != 'flag'){
                return;
            }
            [obj.className,this.minenumDom.innerHTML] = obj.className == 'flag' ? ['',++this.surplusMine]:['flag',--this.surplusMine];  //这里用三目运算符简化判断和赋值
        }
    }
    
}

Mine.prototype.openAround = function(square){
    var [around_num, around_mine, around_flag] = this.getAround(square);
    if(around_flag.length >= square.value){  //当雷数不小于被点击的方块内的数字时执行
        for(var i = 0; i < around_num.length; i++){
            var x = around_num[i][0],
                y = around_num[i][1];
            if(this.tds[x][y].className == ''){
                this.tds[x][y].innerHTML = this.squares[x][y].value;
                this.tds[x][y].className = cl[this.squares[x][y].value] + ' number';
                this.uncovSquareNum--;
                if(this.squares[x][y].value == 0){
                    this.openAround(this.squares[x][y]);
                }
            }
        }
        for(i = 0; i < around_mine.length; i++){
            x = around_mine[i][0];
            y = around_mine[i][1];
            if(this.tds[x][y].className == ''){
                this.gameOver(0,this.tds[x][y]);
            }
        }
    }          
}

Mine.prototype.gameOver = function(win,clickTd){
    this.timeover();
    for(var i = 0; i < this.tr; i++) {
        for(var j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'mine' && this.tds[i][j].className != 'flag'){
                if(win){
                    this.tds[i][j].className = 'flag';
                    this.minenumDom.innerHTML = --this.surplusMine;
                }else{
                    this.tds[i][j].className = 'mine';
                }
            }
            this.tds[i][j].onmousedown = null;
            this.tds[i][j].onmouseup = null;
        } 
    }
    win?console.log('你赢了'):console.log('你失败了');
    if(clickTd){
        clickTd.style.backgroundColor = 'red';
    }
}


btns[0].onclick();  //初始化游戏


