const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7

const background = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	imageSrc: './img/background.png'
})

const player = new Fighter({
	position: {
	x: 0,
	y: 0
	},
	velocity: {
		x: 0,
		y: 10
	},
	offset: {
		x: 0,
		y: 0
	},
	imageSrc: './img/Player/Idle.png',
	framesMax: 8,
	scale: 5,
	offset: {
		x: 150,
		y: 70
	},
	sprites: {
		idle: {
			imageSrc: './img/Player/Idle.png',
			framesMax: 1
		},
		run: {
			imageSrc: './img/Player/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './img/Player/JumpAndFall.png',
			framesMax: 2
		},
		fall: {
			imageSrc: './img/Player/JumpAndFall.png',
			framesMax: 2
		},
		attack: {
			imageSrc: './img/Player/GroundCombo1.png',
			framesMax: 8
		},
		takeHit: {
			imageSrc: './img/Player/TakeHit.png',
			framesMax: 1
		},
		death: {
			imageSrc: './img/Player/Die.png',
			framesMax: 4
		}
	},
	attackBox: {
		offset: {
			x: 50,
			y: 50
		},
		width: 130,
		height: 50
	}
})

const enemy = new Fighter({
	position: {
	x: 400,
	y: 100
	},
	velocity: {
		x: 0,
		y: 0
	},
	color: 'blue',
	offset: {
		x: 10,
		y: 0
	},
	imageSrc: './img/Enemy/Idle.png',
	framesMax: 4,
	scale: 3.25,
	offset: {
		x: 215,
		y: 245
	},
	sprites: {
		idle: {
			imageSrc: './img/Enemy/Idle.png',
			framesMax: 4
		},
		run: {
			imageSrc: './img/Enemy/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './img/Enemy/Jump.png',
			framesMax: 2
		},
		fall: {
			imageSrc: './img/Enemy/Fall.png',
			framesMax: 2
		},
		attack: {
			imageSrc: './img/Enemy/Attack1.png',
			framesMax: 4
		},
		takeHit: {
			imageSrc: './img/Enemy/Take hit.png',
			framesMax: 3
		},
		death: {
			imageSrc: './img/Enemy/Death.png',
			framesMax: 7
		}
	},
	attackBox: {
		offset: {
			x: -170,
			y: 50
		},
		width: 170,
		height: 50
	}
})

console.log(player)

const keys = {
	a: {
		pressed: false
	}, 
	d: {
		pressed: false
	},
	w: {
		pressed: false
	},
	ArrowRight: {
		pressed: false
	},
	ArrowLeft: {
		pressed: false
	}

}

decreaseTimer()

function animate(){
	window.requestAnimationFrame(animate)
	c.fillStyle = 'black'
	c.fillRect(0, 0, canvas.width, canvas.height)
	background.update()
	c.fillStyle = 'rgba(255, 255, 255, 0.15)'
	c.fillRect(0,0,canvas.width, canvas.height)
	player.update()
	enemy.update()

	player.velocity.x = 0
	enemy.velocity.x = 0

	//player movement

	if(keys.a.pressed && player.lastKey === 'a'){
		player.velocity.x = -5
		player.switchSprite('run')
	} else if (keys.d.pressed && player.lastKey === 'd') {
		player.velocity.x = 5
		player.switchSprite('run')
	} else {
		player.switchSprite('idle')
	}

	//jumping
	if(player.velocity.y < 0){
		player.switchSprite('jump')
	} 


	//enemy movement
	if(keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft'){
		enemy.velocity.x = -5
		enemy.switchSprite('run')
	} else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
		enemy.velocity.x = 5
		enemy.switchSprite('run')
	} else {
		enemy.switchSprite('idle')
	}

	//jumping
	if(enemy.velocity.y < 0){
		enemy.switchSprite('jump')
	} 
	else if (enemy.velocity.y > 0) {
		enemy.switchSprite('fall')
	}

	//detect for collision & enemy gets hit
	if(
		rectangularCollision({
			rectangle1: player,
			rectangle2: enemy
		})
		&&
		player.isAttacking && player.framesCurrent === 1
		)
	{
		enemy.takeHit()
		player.isAttacking = false
		document.querySelector('#enemyHealth').style.width = enemy.health + '%'
	}

	//if player misses
	if(player.isAttacking && player.framesCurrent === 1) {
		player.isAttacking = false
	}

	//enemy + player gets hit
	if(
		rectangularCollision({
			rectangle1: enemy,
			rectangle2: player
		})
		&&
		enemy.isAttacking && enemy.framesCurrent === 2
		)
	{
		player.takeHit()
		enemy.isAttacking = false
		document.querySelector('#playerHealth').style.width = player.health + '%'
	}

	//if enemy misses
	if(enemy.isAttacking && enemy.framesCurrent === 2) {
		enemy.isAttacking = false
	}

	// end game based on health
	if(enemy.health <= 0 || player.health <= 0) {
		determineWinner({player, enemy, timerId})
	}
}

animate()

window.addEventListener('keydown', (event) =>{
	if(!player.dead) {
		switch(event.key){
			//player
			case 'd' :
				keys.d.pressed = true
				player.lastKey = 'd'
				break;
			case 'a' :
				keys.a.pressed = true
				player.lastKey = 'a'
				break;
			case 'w' :
				player.velocity.y = -15
				player.lastKey = 'w'
				break
			case ' ' :
				player.attack()
				break
		}
	}
	
	if (!enemy.dead) {
		switch(event.key) {
			//enemy
			case 'ArrowRight' :
				keys.ArrowRight.pressed = true
				enemy.lastKey = 'ArrowRight'
				break
			case 'ArrowLeft' :
				keys.ArrowLeft.pressed = true
				enemy.lastKey = 'ArrowLeft'
				break
			case 'ArrowUp' :
				enemy.velocity.y = -15
				break
			case 'ArrowDown' :
				enemy.attack()
				break
		}
	}
})

window.addEventListener('keyup', (event) =>{
	switch(event.key){
	case 'd' :
		keys.d.pressed = false
		break;
	case 'a' :
		keys.a.pressed = false
		break;
	case 'w' :
		keys.w.pressed = false
		break;

	}
	//enemy
	switch(event.key){
	case 'ArrowRight' :
		keys.ArrowRight.pressed = false
		break;
	case 'ArrowLeft' :
		keys.ArrowLeft.pressed = false
		break;
	}
})
