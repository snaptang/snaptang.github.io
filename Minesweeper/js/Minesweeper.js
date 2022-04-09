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
        var n = 0;
        for(var m = 0; m < mine.tr; m++){
            for(var j = 0; j < mine.td; j++){
                if(mine.squares[m][j].type == 'mine'){
                    n++;
                }
            }
        }
        console.log(n);
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

    this.parent = document.querySelector('.gameBox');
    this.init();
}

Mine.prototype.randomNum = function(){  //随机生成雷的位置
    var square = new Array(this.tr * this.td);
    for(var i = 0; i < square.length; i++){
        square[i] = i;
    }
    square.sort(function(){return 0.5 - Math.random()});
    return square.slice(0,this.mineNum);
}

Mine.prototype.init = function(){
    var rn = this.randomNum();  //雷在格子里的位置
    var n = 0;  //用来找到格子对应的索引
    for(var i = 0; i < this.tr; i++){
        this.squares[i] = [];
        for(var j = 0; j < this.td; j++){
            // this.square[i][j] = ;
            if(rn.indexOf(++n) != -1){
                this.squares[i][j] = {type:'mine', x:j, y:i};
            }else{
                this.squares[i][j] = {type:'number', x:j, y:i, value:0};
            }
        }
    }
    this.parent.oncontextmenu = function(){
        return false;
    }
    this.updateNum();
    this.createDom();

    this.minenumDom = document.querySelector('.mineNum');
    this.minenumDom.innerHTML = this.surplusMine;
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
                // this.style.backgroundColor
                This.play(e,this);
            }
            
            this.tds[i][j] = domTd;

            // if(this.squares[i][j].type == 'mine'){
            //     domTd.className = 'mine';
            // }
            // if(this.squares[i][j].type == 'number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            // }
            domTr.appendChild(domTd);
        }

        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';
    this.parent.appendChild(table);
}

Mine.prototype.getAround = function(square){
    var x = square.x,
        y = square.y,
        result = [];  //返回找到的格子的坐标

    for(var i = x-1; i <= x+1; i++){
        for(var j = y-1; j <= y+1; j++){
            if( 0 <= i && i < this.tr &&
                0 <= j && j < this.td &&
                this.squares[j][i].type != 'mine'
                ){
                    result.push([j,i]);
                }
        }
    }

    return result;
}

Mine.prototype.updateNum = function(){
    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'number'){
                continue;
            }
            var num = this.getAround(this.squares[i][j]);

            for(var k = 0; k < num.length; k++){
                this.squares[num[k][0]][num[k][1]].value++;
            }
        }
    }
}

var cl = ['zero','one','two','three','four','five','six','seven','eight'];  //简化游戏中指示方块周围雷数量的数字

Mine.prototype.play = function(e,obj){
    if(e.which == 1 || e.which == 3){
        // var e_which = e.which;
        // obj.onmousedown = function(e,e_which,obj){

        // }
        if(e.which == 1 && obj.className != 'flag'){
            var curSquare = this.squares[obj.pos[0]][obj.pos[1]];  //被点击的方块的信息
            if(curSquare.type == 'number'){
                obj.innerHTML = curSquare.value;
                obj.className = cl[curSquare.value];
                if(curSquare.value == 0){
                    this.getAllZero(curSquare);
                }
            }else{
                this.gameOver(obj);
            }
        }else if(e.which == 3){
            if((obj.className || this.surplusMine == 0 )&& obj.className != 'flag'){
                return;
            }
            [obj.className,this.minenumDom.innerHTML] = obj.className == 'flag' ? ['',++this.surplusMine]:['flag',--this.surplusMine];  //这里用三目运算符简化判断和赋值
        }
    }
    
}

Mine.prototype.getAllZero = function(square){
    var around = this.getAround(square);          
    for(var i = 0; i < around.length; i++){
        var x = around[i][0],
            y = around[i][1];
        if(this.tds[x][y].className == ''){
            this.tds[x][y].innerHTML = this.squares[x][y].value;
            this.tds[x][y].className = cl[this.squares[x][y].value];
            if(this.squares[x][y].value == 0){
                this.getAllZero(this.squares[x][y]);
            }
        }
    }
}

Mine.prototype.gameOver = function(clickTd){
    for(var i = 0; i < this.tr; i++) {
        for(var j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'mine' && this.tds[i][j].className != 'flag'){
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
        
    }  
    if(clickTd){
        clickTd.style.backgroundColor = 'red';
    }
}


btns[0].onclick();  //初始化游戏


