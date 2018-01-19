/*
 *  锅哥
 *  微信： tornodo
 *  博客：https://www.jianshu.com/u/1b05a5363c32
 *  微信公众号： guo_game
 */

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

game.states = {};
// 引导
game.states.boot = function() {
    this.preload = function() {
        this.load.image('loading', 'assets/image/progress.png');
    },
    this.create = function() {
        this.state.start('preloader');
    }
}
// 用来显示资源加载进度
game.states.preloader = function() {
    this.preload = function() {
		this.day = '#787878';
    	game.stage.backgroundColor = this.day;
        var loadingSprite = this.add.sprite((this.world.width - 311) / 2, this.world.height / 2, 'loading');
        this.load.setPreloadSprite(loadingSprite, 0);
        game.load.tilemap('map', 'assets/image/map.json', null, Phaser.Tilemap.TILED_JSON);//加载tile地图（json格式的）
    	game.load.image('tiles', 'assets/image/super_mario.png');
        this.load.spritesheet('player', 'assets/image/dude.png', 32, 48);//加载序列图，每一个图像都是32X48
    },
    this.create = function() {
        this.state.start('start');
    }
}

//游戏界面
game.states.start = function() {
    this.preload = function() {
        ///初始化状态
        this.gravityDown = 2300;//下落速度
        this.gravityUp = -650;//跳跃高度
        this.gravityLeft = -150;//左行走速度
        this.gravityRight = 150;//右行走速度
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.input.maxPointers = 1;
    },
    this.create = function() {
		this.day = '#6888FF';
    	game.stage.backgroundColor = this.day;
    	
    	this.map = this.add.tilemap('map');
    	this.map.addTilesetImage('super_mario', 'tiles');//图块名称
    	this.map.setCollision(11);//设置碰撞检测
    	this.map.setCollisionBetween(14, 16);
    	this.map.setCollisionBetween(20, 25);
    	this.map.setCollisionBetween(27, 29);
    	this.map.setCollision(40);
    	this.layer = this.map.createLayer('layer');//加载图层
//  	this.layer.debug = true;//开启图层调式
    	this.layer.resizeWorld();
    	
    	this.player = this.add.sprite(0, 0, 'player');
	    game.physics.arcade.enable(this.player);//开启物理引擎
    	this.player.anchor.set(0.5);
    	this.player.x = this.player.width;
    	this.player.y = game.world.height - this.player.height;
	    this.player.animations.add('left', [0, 1, 2, 3], 10, true);//左跑动画
	    this.player.animations.add('right', [5, 6, 7, 8], 10, true);//右跑动画
	    this.player.frame = 4;//默认显示第5张图片
	    this.player.body.gravity.y = this.gravityDown;
	    this.player.body.collideWorldBounds = true;//检测边界，碰撞后反弹（需设置反弹参数）
	    game.camera.follow(this.player);//摄像机跟随主角
	    
	    this.map.setTileIndexCallback(11, this.getCoin, this);//跟金币做碰撞检测
		this.cursors = game.input.keyboard.createCursorKeys();//上下左右四个键
    },
    this.getCoin = function(sprite, coin) {
		coin.alpha = 0;//透明（看不到了）
		coin.setCollision(false, false, false, false);//碰撞过一次后就不做碰撞了
    	this.layer.dirty = true;//告诉引擎重新绘制图层（因为金币跟障碍做到了一张图层上）
    	return false;
    },
    this.update = function() {
    	game.physics.arcade.collide(this.player, this.layer);//碰撞检测
    	if (this.cursors.up.isDown && (this.player.body.onFloor() 
    		|| this.player.body.wasTouching.down === true)) {//跳跃的条件
	        this.player.body.velocity.y = this.gravityUp;//跳跃
	    }
	
	    if (this.cursors.left.isDown) {//向左跑
	        this.player.body.velocity.x = this.gravityLeft;
	        this.player.animations.play('left');
	    } else if (this.cursors.right.isDown) {//向右跑
	        this.player.body.velocity.x = this.gravityRight;
	        this.player.animations.play('right');
	    } else {//静止
	        this.player.body.velocity.x = 0;
	        this.player.animations.stop();
	        this.player.frame = 4;
	    }
	    
	    if (this.player.y + this.player.height / 2 >= game.world.height) {//掉落出去
	    	this.player.kill();
	    	this.player.reset(this.player.width, game.world.height - this.player.height);
	    }
    }
}

game.state.add('boot', game.states.boot);
game.state.add('preloader', game.states.preloader);
game.state.add('start', game.states.start);
game.state.start('boot');