
/* **************************************************************************************** */
/* ************************************** Class Canvas ************************************ */
/* **************************************************************************************** */

class Canvas {

	constructor(canvas) {

		this.element = document.getElementById(canvas);
		this.ctx = this.element.getContext("2d");
		this.cW = this.ctx.canvas.width;
		this.cH = this.ctx.canvas.height;
		this.startDrawX = 0;
		this.startDrawY = 0;

	}
		
	setStartDrawX(sdx) {
		this.startDrawX = sdx;
	}

	redraw(game) { 

		this.ctx.clearRect(this.startDrawX, this.startDrawY, this.cW, this.cH); // vycistenie platna

		game.world.stage.render(this);	// vykreslenie stage-u
		game.world.teammate.render(this); // vykreslenie teammatea
		game.world.player.render(this); // vykreslenie playera
		game.infobox.render(game); // vykreslenie infoboxu
		game.world.player.inventory.render(this.ctx); // vykreslenie inventara

		this.ctx.font = "25px 'Ubuntu', sans-serif";
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillText(game.fps,this.cW-45,40);

		game.dialogbox.render(this.ctx); // vykreslenie dialogboxu

	}


}


/* **************************************************************************************** */
/* ********************************** Class Inventory ************************************* */
/* **************************************************************************************** */

class Inventory {

	constructor(img,x,y,w,h,maxItems) {

		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.bgImg = img;
		this.maxItems = maxItems;
		this.items = [];
		this.itemsWidth = 50;
		this.itemsHeight = 50;
		this.itemStartX = this.x + ((this.width - this.itemsWidth) / 2);
		this.itemStartY = this.y+30;

	}

	add(item) {
		this.items.push(item);
	}

	remove(NameOrIndex) {
	
		// ak je to objname (string)
		if(isNaN(NameOrIndex)) {

			let pos = -1;

			this.items.forEach((item,i) => {
				if(item.name == NameOrIndex) pos = i;
			});

			if(pos != -1) this.items.splice(pos,1);

		}
		else { // ak je to index (cislo)
			this.items.splice(NameOrIndex,1);
		}

	}

	render(ctx) {

		ctx.drawImage(this.bgImg,this.x,this.y,this.width,this.height);
		ctx.font = "bold 13px 'Ubuntu', sans-serif";
		ctx.fillText("Inventár",this.x+13,this.y+15);

		this.items.forEach((item,i) => {
			ctx.fillStyle="#ffffff";
			ctx.fillRect(this.itemStartX,this.itemStartY+((this.itemsHeight+5)*i),this.itemsWidth,this.itemsHeight);
			ctx.drawImage(item.img,this.itemStartX,this.itemStartY+((this.itemsHeight+5)*i),this.itemsWidth,this.itemsHeight);
		});

	}

}


/* **************************************************************************************** */
/* ************************************** Class Sprite ************************************ */
/* **************************************************************************************** */

class Sprite {

	constructor(w,h,x,y,image,looping,solid,interact,pickable,visible) {
	
		this.width = w;
		this.height = h;
		this.x = x;
		this.y = y;
		this.speed = 0; // momentalna rychlost
		this.animCount = 0;

		this.looping = looping; // ci sa meni(nieco robi) pocas gameLoopu
		this.solid = solid; // ci je pevny alebo nie (da sa cez neho prechadzat alebo nie)
		this.interactive = interact; // ci je interaktivny s hracom ked s nim koliduje (1- ano, 0- nie)
		this.pickable = pickable; // ci je to zdvihnutelne.. ci si to mozes pridat do inventara
		this.visible = visible; // ci je objekt viditelny.. 1- viditelny, 0-neviditelny

		this.img = image;
		if(this.img != null) {
			this.imgW = this.img.width;
			this.imgH = this.img.height;
		}

	}

	setPosition(x,y) {
		this.x = x;
		this.y = y;
	}

	render(ctx) {
		if(this.visible == 1) ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
	}

}



/* **************************************************************************************** */
/* ************************************** Class Player ************************************ */
/* **************************************************************************************** */

class Player extends Sprite {

	constructor(game,w,h,x,y,type,image,room) { // potom sa nebude posielat IMGsrc to sa nastavi podla typu.. 

		super(w,h,x,y,image,0,1,0,0,1);
		this.socket = game.socket;
		this.type = type;
		this.jumpHeight = -60; // vyska do ktorej vyskoci
		this.direction = 1; // 0 vlavo, 1 vpravo, 2 hore
		this.moves = [false, false, false] // pole pohybov ktore prave robi indexy: 0-hybe sa vlavo, 1-hybe sa vpravo, 2-skace
		this.room = room;
		this.MAXjump = 0;
		this.jumpSpeed = 4;
		this.MAXspeed = 2;
		this.collisions = []; // pole kolizii
		this.canDrive = false;

		let inventoryIMG = game.findImage("inventory_bg");
		this.inventory = new Inventory(inventoryIMG,720,120,80,205,3);

		this.canPickUp = null;
		this.controlBlock = false;

	}

	control(game) { 

			document.addEventListener('keydown', (event) => {

				if(!this.controlBlock) {

					// sipka hore
					if(event.keyCode == 38) {

						// ak je na zemi alebo na niecom pevnom (solid) jump je povoleny
						let jumpAvailable = game.world.physics.footCollisionDetect(this);

						// ak je jump povoleny
						if (jumpAvailable) {
							this.moves[2] = true; // skace
							this.MAXjump = this.y + this.jumpHeight;
						}

					}

					// sipka vlavo
					if(event.keyCode == 37) {
						this.moves[0] = true; // ide vlavo
						this.moves[1] = false;		
					} 

					// sipka vpravo
					if(event.keyCode == 39) {
						this.moves[1] = true; // ide vpravo
						this.moves[0] = false;
					} 

					// enter
					if(event.keyCode == 13) {

						let downStairsColl = this.collisions.filter((coll) => { return coll.name == "downstairs_door"; });
						let upStairsColl = this.collisions.filter((coll) => { return coll.name == "upstairs_door"; });

						if(downStairsColl.length > 0) this.y = 360;
						if(upStairsColl.length > 0) this.y = 200;

						//ak je questAvailable
						if(game.world.stage.questAvailable == 1) {
							this.socket.emit('start quest', this.socket.id);
							game.world.stage.quest.go(game); // zapneme ulohu 
							this.moves = [false,false,false]; // nehybe sa
							this.speed = 0; // rychlost 0
							this.animCount = 0;
						}

						if(this.canDrive == "forward") {
							this.socket.emit('drive forward');
							game.story.drivingCar_scene(game); 
						}
						else if(this.canDrive == "backward") {
							this.socket.emit('drive backward');
							game.story.drivingCarBack_scene(game);
						}

					}

					// spacebar
					if(event.keyCode == 32) {
						// ak moze nieco zdvihnut/zobrat
						if(this.canPickUp != null && this.inventory.items.length < this.inventory.maxItems) {
							game.world.player.socket.emit('delete object', { sid: this.socket.id, object: this.canPickUp});
							this.inventory.add(this.canPickUp); // prida do inventara
							game.world.stage.deleteObject(this.canPickUp); // vymaze objekt z mapy/stageu
							this.canPickUp = null;
						}
					}

				}

				// escape
				if(event.keyCode == 27) {
					if(game.dialogbox.visible) {
						game.dialogbox.hide();
						this.controlBlock = false;
					}
					else { 
						game.dialogbox.show();
						this.controlBlock = true;
					}
				}

			});

			document.addEventListener('keyup', (event) => {

				if(!this.controlBlock) {

					if (event.keyCode == 37){
						this.moves[0] = false; // stoji
					} 

					if (event.keyCode == 39) {
						this.moves[1] = false; // stoji
					} 

					this.speed = 0;
					this.animCount = 0;

				}

			});


			game.canvas.element.addEventListener('click', (event) => {

				if(!this.controlBlock) {

					var rect = game.canvas.element.getBoundingClientRect();
					var click_x = event.clientX - rect.left;
					var click_y = event.clientY - rect.top;

					// prejde vsetky veci (indexy) v inventary ci na niektory nebolo kliknute
					for (let i = 0; i < this.inventory.maxItems; i++) {
						
						let itemStartsX = this.inventory.itemStartX;
						let itemEndsX = this.inventory.itemStartX + this.inventory.itemsWidth;
						let itemStartsY = this.inventory.itemStartY+((this.inventory.itemsHeight+5)*i);
						let itemEndsY = this.inventory.itemStartY+((this.inventory.itemsHeight+5)*i) + this.inventory.itemsHeight;

						if(click_x > itemStartsX && click_x < itemEndsX && click_y > itemStartsY && click_y < itemEndsY) {
							
							if(this.inventory.items[i]) {

								let name = this.inventory.items[i].name;
								let type = this.inventory.items[i].type;
								let desc = this.inventory.items[i].description;
								let w = this.inventory.items[i].width;
								let h = this.inventory.items[i].height;
								let image = this.inventory.items[i].img;
								let x = this.x;
								let y = this.y + (this.height-h);

								this.socket.emit('create gameObject', { sid: socket.id, name: name, type: type, desc: desc, w: w, h: h, x: x, y: y, imgSrc: image.src });
								game.world.stage.createGameObject(name,type,desc,w,h,x,y,image); // vytvory objekt v stage vo svete
								this.inventory.remove(i); // odstrani objekt z inventara

							}

						}

					}

				}

			});

	}

	moving(game) {

		if (this.moves[0] == true){
			this.moveLeft(game);
		}
		else if (this.moves[1] == true){
			this.moveRight(game);
		}

		if (this.moves[2] == true){
			this.jump(game.world);
		}

	}

	moveLeft(game) {

		this.speed = 0 - this.MAXspeed; // rychlost pohybu (-) vlavo
		let collisionTest = game.world.physics.collisionTest(game.world, this.speed, 0);

		// ak collisionTest vrati 1, po zmene pozicie nebude viac kolizii cize sa moze pohnut inak nie
		if (collisionTest == 1) {

			this.direction = 0;
			this.x += this.speed; 
			
		}

		if(this.x <= game.canvas.startDrawX+100) game.canvas.startDrawX += this.speed;

	}

	moveRight(game) {

		this.speed = this.MAXspeed; // rychlost pohybu (+) vpravo
		let collisionTest = game.world.physics.collisionTest(game.world, this.speed, 0);

		// ak collisionTest vrati 1, po zmene pozicie nebude viac kolizii cize sa moze pohnut inak nie
		if (collisionTest == 1) {
			this.direction = 1;
			this.x += this.speed;
		}

		if(this.x >= game.canvas.startDrawX-this.width+game.canvas.cW-100) game.canvas.startDrawX += this.speed;

	}

	jump(world) {

		let headCollision = game.world.physics.headCollisionDetect(this);	
		this.jumping = true;

		if(this.y > this.MAXjump && headCollision == false) {
			this.y = this.y - this.jumpSpeed;
		} 
		else {
			this.moves[2] = false; // neskace
			this.jumping = false;
		}

	}

	sendPosition(game) {
		
		// odosielanie informacii o hracovi na server cez socket
		game.socket.emit('position', { room: this.room, x: this.x, y: this.y, speed: this.speed, animCount: this.animCount, direction: this.direction, jumping: this.jumping });
	
	}

	render(canvas) {

		// ak nevykreslujeme skok ale nejaky pohyb
		if(!this.jumping) {
		
			if(this.speed == 0) {

				let startClipY = (this.imgH/3) * 2;
				let startClipX = (this.imgW/8) * (this.direction+2);
				canvas.ctx.drawImage(this.img, startClipX, startClipY, this.imgW/8, this.imgH/3, this.x-15-canvas.startDrawX, this.y-canvas.startDrawY, this.imgW/8, this.imgH/3);

			}
			else {

				if (this.speed > 0) {
					this.animCount += 0.2;  //rychlost animacie krokov
				}
				else if (this.speed < 0) {
					this.animCount += 0.2;  //rychlost animacie krokov
				} 

				let startClipY = (this.imgH/3) * this.direction;
				let startClipX = (this.imgW/8) * (Math.floor(this.animCount) % 8);
				canvas.ctx.drawImage(this.img, startClipX, startClipY, this.imgW/8, this.imgH/3, this.x-15-canvas.startDrawX, this.y-canvas.startDrawY, this.imgW/8, this.imgH/3);

			}

		}
		else{ //ak vykreslujeme skok
			let startClipY = (this.imgH/3) * 2;
			let startClipX = (this.imgW/8) * this.direction;
			canvas.ctx.drawImage(this.img, startClipX, startClipY, this.imgW/8, this.imgH/3, this.x-15-canvas.startDrawX, this.y-canvas.startDrawY, this.imgW/8, this.imgH/3);
		}

	}

}


/* **************************************************************************************** */
/* ************************************** Class Teammate ********************************** */
/* **************************************************************************************** */

class Teammate extends Sprite {

	constructor(w,h,x,y,type,image) {

		super(w,h,x,y,image,0,1,0,0,1);
		this.type = type;
		this.direction = 0;
		this.jumping = false;
		this.collisions = [];

	}

	updatePosition(teammate) {

		this.setPosition(teammate.x,teammate.y);
		this.speed = teammate.speed;
		this.animCount = teammate.animCount;
		this.direction = teammate.direction;
		this.jumping = teammate.jumping;

	}

	render(canvas) {

		// ak nevykreslujeme skok ale nejaky pohyb
		if(!this.jumping) {

			if(this.speed == 0) {

				let startClipY = (this.imgH/3) * 2;
				let startClipX = (this.imgW/8) * (this.direction+2);
				canvas.ctx.drawImage(this.img, startClipX, startClipY, this.imgW/8, this.imgH/3, this.x-15-canvas.startDrawX, this.y-canvas.startDrawY, this.imgW/8, this.imgH/3);

			}
			else {

				let startClipY = (this.imgH/3) * this.direction;
				let startClipX = (this.imgW/8) * (Math.floor(this.animCount) % 8);
				canvas.ctx.drawImage(this.img, startClipX, startClipY, this.imgW/8, this.imgH/3, this.x-15-canvas.startDrawX, this.y-canvas.startDrawY, this.imgW/8, this.imgH/3);

			}

		}
		else{ //ak vykreslujeme skok
			let startClipY = (this.imgH/3) * 2;
			let startClipX = (this.imgW/8) * this.direction;
			canvas.ctx.drawImage(this.img, startClipX, startClipY, this.imgW/8, this.imgH/3, this.x-15-canvas.startDrawX, this.y-canvas.startDrawY, this.imgW/8, this.imgH/3);
		}

	}

}

/* **************************************************************************************** */
/* ************************************ Class GameObject ********************************** */
/* **************************************************************************************** */

class GameObject extends Sprite {

	constructor(objName,type,desc,w,h,x,y,image,looping,solid,interactive,pickable,visible) {
		super(w,h,x,y,image,looping,solid,interactive,pickable,visible);
		this.name = objName;
		this.type = type;
		this.description = desc;
	}

	render(canvas) {
		if(this.visible == 1) canvas.ctx.drawImage(this.img,this.x-canvas.startDrawX,this.y-canvas.startDrawY,this.width,this.height);
	}

	renderInventory(ctx) {
		ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
	}

}


/* **************************************************************************************** */
/* ************************************** Class Block ************************************* */
/* **************************************************************************************** */

class Block extends Sprite {

	constructor(name,w,h,x,y,image,solid,interactive,visible) {
		super(w,h,x,y,image,0,solid,interactive,0,visible);
		this.name = name;
	}

	render(canvas) {
		if(this.visible == 1) canvas.ctx.drawImage(this.img,this.x-canvas.startDrawX,this.y-canvas.startDrawY,this.width,this.height);
	}

}

/* **************************************************************************************** */
/* ************************************** Class Laser ************************************* */
/* **************************************************************************************** */

class Laser extends GameObject {

	constructor(objName,type,w,h,x,y,imgON,imgOFF,dangerous,movable,moveType,moveSpeed,c1,c2,flashing,fspeed) {
		
		super(objName,type,"laser",w,h,x,y,imgON,1,0,1,0,1);

		this.imgOn = imgON;
		this.imgOff = imgOFF;
		
		this.dangerous = dangerous; // ci je nebezpecny
		this.movable = movable; // ci je pohyblivy
		this.flashing = flashing; // ci laser blika
		this.flashingSpeed = fspeed; // rychlost blikania

		// ak je pohyblivy.. typ pohybu, rychlost, smer, kde zacina a konci
		this.moveType = moveType; // vertical, horizontal
		this.moveSpeed = moveSpeed;
		this.startCoord = c1; // lava alebo horna 
		this.endCoord = c2; // prava alebo dolna
		
		// direction: 0 - vlavo, 1 - vpravo, 2 - hore, 3 - dole
		if(this.moveType == "horizontal") this.direction = 0; 
		else this.direction = 2;

		this.state = "on";
		this.flashCount = 0;

	}

	changeState() {
		
		if(this.state == "on") this.state = "off";
		else this.state = "on";

		if(this.state == "on") this.img = this.imgOn;
		else this.img = this.imgOff;

	}

	loop() {

		if(this.flashing) {

			if(this.flashingSpeed == this.flashCount) {
				this.changeState();
				this.flashCount = -1;
			}

			this.flashCount++;

		}

		if(this.movable) {

			if(this.moveType == "horizontal") {

				if(this.direction == 0) {

					if(this.x > this.startCoord) 	
						this.x = this.x - this.moveSpeed;
					else
						this.direction = 1;

				}
				else if(this.direction == 1) {

					if(this.x < this.endCoord) 	
						this.x = this.x + this.moveSpeed;
					else
						this.direction = 0;

				}

			}
			else if(this.moveType == "vertical") {

				if(this.direction == 2) {

					if(this.y > this.startCoord) 	
						this.y = this.y - this.moveSpeed;
					else
						this.direction = 3;

				}
				else if(this.direction == 3) {

					if(this.y < this.endCoord) 	
						this.y = this.y + this.moveSpeed;
					else
						this.direction = 2;

				}

			}

		}

	}

	render(canvas) {
		if(this.visible == 1) canvas.ctx.drawImage(this.img,this.x-canvas.startDrawX,this.y-canvas.startDrawY,this.width,this.height);
	}

}


/* **************************************************************************************** */
/* ************************************** Class Door ************************************** */
/* **************************************************************************************** */

class Door extends GameObject {

	constructor(objName,type,w,h,x,y,img_opened,img_closed) {
		super(objName,type,"door",w,h,x,y,img_closed,0,1,1,0,1);
		this.img_opened = img_opened;
		this.img_closed = img_closed;
		this.state = "closed";
	}

	open() {
		this.state = "opened";
		this.img = this.img_opened;
		this.solid = 0;
	}

}


/* **************************************************************************************** */
/* ************************************** Class Station *********************************** */
/* **************************************************************************************** */

class Station extends GameObject {

	constructor(objName,type,w,h,x,y,img_out,img_in) {
		super(objName,type,"station",w,h,x,y,img_out,0,0,0,0,1);
		this.name = objName;
		this.type = type;
		this.img_out = img_out;
		this.img_in = img_in;
		this.state = "outdoor";
	}

	enter() {
		this.img = this.img_in;
		this.state = "indoor";
	}

	leave() {
		this.img = this.img_out;
		this.state = "outdoor";
	}

	render(canvas) {
		if(this.visible == 1) canvas.ctx.drawImage(this.img,this.x-canvas.startDrawX,this.y-canvas.startDrawY,this.width,this.height);
	}

}


/* **************************************************************************************** */
/* ************************************** Class Stage ************************************* */
/* **************************************************************************************** */

class Stage {

	constructor(stageNum) {

		this.stageNum = stageNum;
		this.objects = [];
		this.bgImg;
		this.quest = null; 
		this.stageQuests = [];
		this.questAvailable = 0;
		this.mission = "";	

	}

	load(game) {

		//tu nacita objekty podla toho aky to je level 
		if(this.stageNum == 1) {

			/**************** nacitanie objektov levelu *********************/
			this.bgImg = game.findImage("stage0_bg");
			this.mission = "Zozbierajte všetky potrebné predmety a opravte solárne panely na module aby ste mali energiu.";

			// vytvorenie objektov
			this.objects.push( new Block("zem",3500,20,0,460,game.findImage("zem"),1,0,1) );
			this.objects.push( new Block("neviditelna_stena1",100,100,0,360,game.findImage("zem"),1,0,0) );
			this.objects.push( new Block("neviditelna_stena2",100,100,3400,360,game.findImage("zem"),1,0,0) );
			this.objects.push( new Block("solarne_panely",300,120,620,352,game.findImage("solar_panels"),0,0,1) );
			this.objects.push( new Block("vlajka",120,130,430,325,game.findImage("flag"),0,0,1) );
			this.objects.push( new GameObject("module","module","modul",263,324,160,136,game.findImage("module_od_bp"),0,0,1,0,1) );
			this.objects.push( new Block("rover",230,135,1000,325,game.findImage("rover"),0,0,1) );
			this.objects.push( new Station("station","station",1900,430,1318,30,game.findImage("station"),game.findImage("station_in")) );
			this.objects.push( new Block("station_block1",160,2,1321,350,null,1,0,0) );
			this.objects.push( new Block("station_block2",2,160,1540,140,null,1,0,0) );
			this.objects.push( new Block("station_block3",2,160,2200,140,null,1,0,0) );
			this.objects.push( new Block("station_block4",620,2,1540,140,null,1,0,0) );
			this.objects.push( new Block("station_block5",30,2,1540,170,null,1,0,0) );
			this.objects.push( new Block("station_block6",30,2,2175,170,null,1,0,0) );
			this.objects.push( new Block("station_block7",160,2,2270,350,null,1,0,0) );
			this.objects.push( new Block("station_block8",2,160,3205,290,null,1,0,0) );
			this.objects.push( new Block("charger",80,120,1700,340,game.findImage("charger"),0,0,1) );
			this.objects.push( new Block("doors_block",55,110,2410,350,game.findImage("closedDoor"),1,0,1) );
			this.objects.push( new Door("door1","door",55,110,1470,350,game.findImage("openedDoor"),game.findImage("closedDoor")) );
			this.objects.push( new Block("station_podlazie",750,10,1503,300,game.findImage("zem"),1,0,1) );
			this.objects.push( new GameObject("door1_trigger","trigger","trigger",60,110,1420,350,null,0,0,1,0,0) );
			this.objects.push( new GameObject("upstairs_door","stairs_door","stairs_door",80,130,2000,330,game.findImage("upstairsDoor"),0,0,0,0,1) );
			this.objects.push( new GameObject("downstairs_door","stairs_door","stairs_door",80,130,2000,170,game.findImage("downstairsDoor"),0,0,0,0,1) );
			this.objects.push( new Door("door2","door",78,130,1690,170,game.findImage("openedDoor_led"),game.findImage("closedDoor_led")) );
			this.objects.push( new GameObject("door2_trigger","trigger","trigger",60,130,1720,170,null,0,0,1,0,0) );
			this.objects.push( new GameObject("accumulator1","accumulator1","akumulátor",50,50,1000,360,game.findImage("accumulator"),0,0,0,1,1) ); 
			this.objects.push( new GameObject("accumulator2","accumulator2","akumulátor",50,50,1720,400,game.findImage("accumulator"),0,0,0,1,1) );
			this.objects.push( new GameObject("solarPanel","solarPanel","solárny panel",50,50,700,400,game.findImage("solarPanel"),0,0,0,1,1) ); 
			this.objects.push( new GameObject("converter","converter","DC-AC menič",50,50,2100,240,game.findImage("converter"),0,0,0,1,1) ); 
			this.objects.push( new GameObject("regulator","regulator","regulátor",50,50,2110,400,game.findImage("regulator"),0,0,0,1,1) );
			this.objects.push( new GameObject("ACdevice","ACdevice","notebook",50,50,1560,210,game.findImage("ACdevice"),0,0,0,1,1) );

			// ulohy
			this.stageQuests.push( new SolarPanelsRepairQuest(game,"opravit solarne panely","module") );
			this.stageQuests.push( new Pexeso(game,"pexeso","door1_trigger") );
			this.stageQuests.push( new RgbLedQuest(game,"nastavit RGB LED","door2_trigger") );

		}
		else if(this.stageNum == 2) {

			/**************** nacitanie objektov levelu *********************/
			this.bgImg = game.findImage("stage0_bg");
			this.mission = "Zozbierajte všetky potrebné predmety a opravite laserovú komunikáciu na module.";

			// vytvorenie objektov
			// GameObject(objName,type,w,h,x,y,image,looping,solid,interactive,pickable,visible) <- konstruktor vzor
			this.objects.push( new Block("zem",3500,20,0,460,game.findImage("zem"),1,0,1) );
			this.objects.push( new Block("neviditelna_stena1",100,100,0,360,null,1,0,0) );
			this.objects.push( new Block("neviditelna_stena2",100,100,3400,360,null,1,0,0) );
			this.objects.push( new GameObject("module","module","modul",263,324,160,136,game.findImage("module_od"),0,0,1,0,1) );
			this.objects.push( new Block("solarne_panely",300,120,620,352,game.findImage("solar_panels"),0,0,1) );
			this.objects.push( new Block("vlajka",120,130,430,325,game.findImage("flag"),0,0,1) );
			this.objects.push( new Block("rover",230,135,1000,325,game.findImage("rover"),0,0,1) );
			this.objects.push( new Station("station","station",1900,430,1318,30,game.findImage("station"),game.findImage("station_in")) );
			this.objects.push( new Block("station_block1",160,2,1321,350,null,1,0,0) );
			this.objects.push( new Block("station_block2",2,160,1540,140,null,1,0,0) );
			this.objects.push( new Block("station_block3",2,160,2200,140,null,1,0,0) );
			this.objects.push( new Block("station_block4",620,2,1540,140,null,1,0,0) );
			this.objects.push( new Block("station_block5",30,2,1540,170,null,1,0,0) );
			this.objects.push( new Block("station_block6",30,2,2175,170,null,1,0,0) );
			this.objects.push( new Block("station_block7",160,2,2270,350,null,1,0,0) );
			this.objects.push( new Block("station_block8",2,160,3205,290,null,1,0,0) );
			this.objects.push( new Block("door1",55,110,1470,350,game.findImage("openedDoor"),0,0,1) );
			this.objects.push( new Block("station_podlazie",750,10,1503,300,game.findImage("zem"),1,0,1) );
			this.objects.push( new GameObject("upstairs_door","stairs_door","stairs_door",80,130,2000,330,game.findImage("upstairsDoor"),0,0,0,0,1) );
			this.objects.push( new GameObject("downstairs_door","stairs_door","stairs_door",80,130,2000,170,game.findImage("downstairsDoor"),0,0,0,0,1) );
			this.objects.push( new Block("door2",78,130,1690,170,game.findImage("openedDoor_led"),0,0,1) );
			this.objects.push( new GameObject("door3_trigger","trigger","trigger",60,110,2350,350,null,0,0,1,0,0) );
			this.objects.push( new Door("door3","door",55,110,2410,350,game.findImage("openedDoor"),game.findImage("closedDoor")) );
			this.objects.push( new Block("charger",80,120,1700,340,game.findImage("charger"),0,0,1) );
			this.objects.push( new Laser("laser1","laser",50,20,2750,440,game.findImage("laserH"),null,true,true,"horizontal",1,2730,2820,0,0) );
			this.objects.push( new Laser("laser2","laser",50,20,3000,440,game.findImage("laserH"),null,true,true,"vertical",2,280,440,0,0) );
			this.objects.push( new Laser("laser3","laser",10,150,2620,305,game.findImage("laserV"),game.findImage("laseroff"),true,false,null,0,0,0,true,100) );
			this.objects.push( new GameObject("laser_quest_spawn","spawn","spawn",60,100,2465,350,null,0,0,0,0,0) );
			this.objects.push( new GameObject("laser_item","laser_item","laser",50,50,3080,400,game.findImage("laser_item"),0,0,0,1,1) ); 
			this.objects.push( new GameObject("accumulator","accumulator","akumulátor",50,50,1050,400,game.findImage("accumulator"),0,0,0,1,1) );
			this.objects.push( new GameObject("solarCell","solarCell","solárny článok",50,50,730,400,game.findImage("solarCell"),0,0,0,1,1) ); 
			this.objects.push( new GameObject("audioAmplifier","audioAmplifier","audio zosilňovač",50,50,2660,400,game.findImage("audioAmp"),0,0,0,1,1) ); 
			this.objects.push( new GameObject("audioTransformer","audioTransformer","audio transformátor",50,50,1650,400,game.findImage("audioTransf"),0,0,0,1,1) );
			this.objects.push( new GameObject("medium","medium","notebook",50,50,1560,210,game.findImage("ACdevice"),0,0,0,1,1) );
		 

			// ulohy
			this.stageQuests.push( new LaserCommunicationRepairQuest(game,"opravit laserovu komunikaciu","module") );
			this.stageQuests.push( new LaserTypesQuest(game,"lasery","door3_trigger") );

		}
		else if(this.stageNum == 3) {

			/**************** nacitanie objektov levelu *********************/
			this.bgImg = game.findImage("stage0_bg");
			this.mission = "Zoberte vybité akumulátory z vozidla a nabite ich na stanici.";

			// GameObject(objName,type,w,h,x,y,image,looping,solid,interactive,pickable,visible) <- konstruktor vzor
			this.objects.push( new Block("zem",3500,20,0,460,game.findImage("zem"),1,0,1) );
			this.objects.push( new Block("neviditelna_stena1",100,100,0,360,null,1,0,0) );
			this.objects.push( new Block("neviditelna_stena2",100,100,3400,360,null,1,0,0) );
			this.objects.push( new Block("module",263,324,160,136,game.findImage("module_od"),0,0,1) );
			this.objects.push( new GameObject("module_trigger","module_trigger","module_trigger",263,324,160,136,null,0,0,1,0,0) );
			this.objects.push( new Block("solarne_panely",300,120,620,352,game.findImage("solar_panels"),0,0,1) );
			this.objects.push( new Block("vlajka",120,130,430,325,game.findImage("flag"),0,0,1) );
			this.objects.push( new Block("rover",230,135,1000,325,game.findImage("rover"),0,0,1) );
			this.objects.push( new GameObject("rover_trigger","rover_trigger","rover_trigger",230,135,1000,325,null,0,0,1,0,0) );
			this.objects.push( new Station("station","station",1900,430,1318,30,game.findImage("station"),game.findImage("station_in")) );
			this.objects.push( new Block("station_block1",160,2,1321,350,null,1,0,0) );
			this.objects.push( new Block("station_block2",2,160,1540,140,null,1,0,0) );
			this.objects.push( new Block("station_block3",2,160,2200,140,null,1,0,0) );
			this.objects.push( new Block("station_block4",620,2,1540,140,null,1,0,0) );
			this.objects.push( new Block("station_block5",30,2,1540,170,null,1,0,0) );
			this.objects.push( new Block("station_block6",30,2,2175,170,null,1,0,0) );
			this.objects.push( new Block("station_block7",160,2,2270,350,null,1,0,0) );
			this.objects.push( new Block("station_block8",2,160,3205,290,null,1,0,0) );
			this.objects.push( new Block("door1",55,110,1470,350,game.findImage("openedDoor"),0,0,1) );
			this.objects.push( new Block("station_podlazie",750,10,1503,300,game.findImage("zem"),1,0,1) );
			this.objects.push( new GameObject("upstairs_door","stairs_door","stairs_door",80,130,2000,330,game.findImage("upstairsDoor"),0,0,0,0,1) );
			this.objects.push( new GameObject("downstairs_door","stairs_door","stairs_door",80,130,2000,170,game.findImage("downstairsDoor"),0,0,0,0,1) );
			this.objects.push( new Block("door2",78,130,1690,170,game.findImage("openedDoor_led"),0,0,1) );
			this.objects.push( new Block("door3",55,110,2410,350,game.findImage("openedDoor"),0,0,1) );
			this.objects.push( new Block("charger",80,120,1700,340,game.findImage("charger"),0,0,1) );
			this.objects.push( new GameObject("charger_trigger","charger_trigger","nabíjačka",80,120,1700,340,null,0,0,1,0,0) );
			this.objects.push( new GameObject("accumulator1","discharged_accumulator","vybitý akumulátor",50,50,1000,360,game.findImage("accumulator"),0,0,0,1,1) );
			this.objects.push( new GameObject("accumulator2","discharged_accumulator","vybitý akumulátor",50,50,1020,360,game.findImage("accumulator"),0,0,0,1,1) );
			this.objects.push( new GameObject("wire","wire","vodič",50,50,5275,400,game.findImage("wire"),0,0,0,1,1) ); 
			this.objects.push( new GameObject("resistor","resistor","odpor",50,50,1800,240,game.findImage("resistor"),0,0,0,1,1) );
			this.objects.push( new Block("ostrovcek",1400,20,4600,460,game.findImage("zem"),1,0,1) );
			this.objects.push( new Block("rover2",230,135,4900,325,game.findImage("rover"),0,0,1) );
			this.objects.push( new GameObject("rover_drive_back_trigger","rover_drive_back_trigger","rover_drive_back_trigger",230,135,4900,325,null,0,0,1,0,0) );
			this.objects.push( new Block("neviditelna_stena_o1",100,100,4600,360,null,1,0,0) );
			this.objects.push( new Block("neviditelna_stena_o2",100,100,5900,360,null,1,0,0) );
			this.objects.push( new Block("mining_machine",420,390,5350,90,game.findImage("mining_machine"),0,0,1) );
			this.objects.push( new GameObject("mining_machine_trigger","mining_machine_trigger","mining_machine_trigger",420,390,5350,90,null,0,0,1,0,0) );

			// ulohy
			this.stageQuests.push( new DoorRepairQuest(game,"DoorRepairQuest","module_trigger") );
			this.stageQuests.push( new AccumulatorChargeQuest(game,"AccumulatorChargeQuest","charger_trigger") );
			this.stageQuests.push( new RoverAccumulatorsQuest(game,"RoverAccumulatorsQuest","rover_trigger") );	
			this.stageQuests.push( new ChooseCorrectQuest(game,"ChooseCorrectQuest","mining_machine_trigger") );

		}
		
	}

	createGameObject(name,type,desc,w,h,x,y,img) {
		this.objects.push(new GameObject(name,type,desc,w,h,x,y,img,0,0,1,1,1));
	}

	deleteObject(DeLObject) {

		let position = -1;

		this.objects.forEach((object,i) => {
			if(object.name == DeLObject.name) position = i;
		});

		if(position != -1) this.objects.splice(position,1);

	}

	getObjectByName(objName) {

		let returnedObj = null;

		this.objects.forEach((object) => {
			if(object.name == objName) returnedObj = object;
		});

		return returnedObj;

	}

	render(canvas) {

		//tu vykresli vsetky objekty
		canvas.ctx.drawImage(this.bgImg,0,0,800,500);

		let station = this.getObjectByName("station");
		if(station.state == "indoor") station.render(canvas);

		for (let i = 0; i < this.objects.length; i++) {
			if(this.objects[i].name != "station") this.objects[i].render(canvas);
		}

		if(station.state == "outdoor") station.render(canvas);

	}

}


/* **************************************************************************************** */
/* ************************************** Class World ************************************* */
/* **************************************************************************************** */

class World {

	constructor(game,player,teammate) {

		this.player = player;
		this.teammate = teammate;
		this.stage = new Stage(1);
		this.physics = new Physics();

		this.stage.load(game);

	}

	switchStage(stageNum,game) {
		this.stage = new Stage(stageNum);
		this.stage.load(game);
	};

	collisionsUpdate() {
		this.player.collisions = this.physics.collisionDetection(this,"player");
		this.teammate.collisions = this.physics.collisionDetection(this,"teammate");
	}

	gravity() {
		this.physics.gravityApply(this);
	}

	collisionsCheck(game) {
		this.pickableColls_check();
		this.stationColls_check();
		this.laserColls_check(game);
		this.interactions_check();
	}

	pickableColls_check() {

		let pickableColls = this.player.collisions.filter((object) => { return object.pickable == 1; });
		if(pickableColls.length > 0) {
			this.player.canPickUp = pickableColls[0];
		}
		else {
			this.player.canPickUp = null;
		}

	}

	stationColls_check() {

		// kontrola interakcii so stanicou
		let stageHaveStation = this.stage.objects.filter((object) => { return object.type == "station"; }).length;

		if(stageHaveStation > 0) {
			// kontrola ci je niektory z hracov v stanici ak ano zmeni stav
			let playerStationColl = this.player.collisions.filter((coll) => { return coll.name == "station"; });
			let teammateStationColl = this.teammate.collisions.filter((coll) => { return coll.name == "station"; });

			if(playerStationColl.length > 0 || teammateStationColl.length > 0) 
				this.stage.getObjectByName("station").enter();
			else 
				this.stage.getObjectByName("station").leave();

		}

	}

	laserColls_check(game) {

		let dangerColls = this.player.collisions.filter((collobj) => { return collobj.type == "laser" && collobj.dangerous == true && collobj.state == "on"; });
		
		if (dangerColls.length > 0) {
			let spawn = this.stage.getObjectByName("laser_quest_spawn");
			this.player.setPosition(spawn.x,spawn.y);
			game.canvas.setStartDrawX(this.player.x-(game.canvas.cW/2));
		}

	}

	interactions_check() {

		let playersInteractiveColls = this.findInteractive(this.player.collisions);
		let teammatesInteractiveColls = this.findInteractive(this.teammate.collisions);

		if (playersInteractiveColls.length == 0 || teammatesInteractiveColls.length == 0) {
			this.stage.questAvailable = 0;
			this.player.canDrive = null;
			return;
		}

		playersInteractiveColls.forEach((playerCollObj) => {

			teammatesInteractiveColls.forEach((teammateCollObj) => {

				if(playerCollObj.name == teammateCollObj.name) {
				
					let count = 0;

					this.stage.stageQuests.forEach((quest) => {

						if (quest.MGobject == playerCollObj.name) { 
							this.stage.questAvailable = 1;
							this.stage.quest = quest;
							count++;
						}

					});

					if(count <= 0) {
						this.stage.questAvailable = 0;
						this.stage.quest = null;
					}

					if(playerCollObj.name == "rover_drive_trigger") {
						this.player.canDrive = "forward"; 
					}
					else if(playerCollObj.name == "rover_drive_back_trigger") {
						this.player.canDrive = "backward"; 
					}
					else {
						this.player.canDrive = null; 
					}
				}

			});

		});

	}

	findInteractive(collisions) {
		return collisions.filter((object) => { return object.interactive == 1; });
	}

}


/* **************************************************************************************** */
/* ************************************** Class Story ************************************* */
/* **************************************************************************************** */

class Story {

	constructor() {

		this.request = undefined;
		this.step = 0;

		// intro scene
		this.moduleY = -150;
		this.flameY = 135;
		this.charactersAnimCount = 0;
		this.electronX = 280;
		this.photonX = 230;
		this.flameAnimCount = 0;
		this.meteorX = 500;
		this.meteorY = -60;

		// passage stage1 scene
		this.panelsAnimCount = 0;

		// drive car scene
		this.wheelAnimCount = 0;
		this.stationX = 500;
		this.solarPanelsX = -170;
		this.stoneX = 2990;

	}

	start(game) {

		game.menu.hide();

		game.socket.on('teammate disconnected', () => {
			this.introductionEnd(game);
			game.end("teammate disconnected");			
		});

		this.introduction(game);
	
	}

	end(game) {
		game.world.player.controlBlock = false;
		game.gameLoop();
	}

	/*************************** INTRO SCENE ******************************/

	introduction(game) {

		if(this.step < 1500) {

			let text = "Cieľom tejto misie bolo vyťažiť novoobjavený nerast.";

			// vykreslienie zakladnych obrazkov (kt sa nemenia)
			game.canvas.ctx.drawImage(game.findImage("stage0_bg"),0,0,game.canvas.cW,game.canvas.cH);
			game.canvas.ctx.drawImage(game.findImage("flag"),430,325,120,130);
			game.canvas.ctx.drawImage(game.findImage("solar_panels"),620,352,300,120);

			// foton a elektron
			let photonImg = game.findImage("photon");
			let ph_imgW = photonImg.width/8;
			let ph_imgH = photonImg.height/3;
			let electronImg = game.findImage("electron");
			let el_imgW = electronImg.width/8;
			let el_imgH = electronImg.height/3;

			// modul klesa
			if(this.step < 287) {

				let flameImg = game.findImage("flame");
				let imgW = flameImg.width/3;
				let imgH = flameImg.height;
				let startClipX = imgW * (Math.floor(this.flameAnimCount) % 3);
				game.canvas.ctx.drawImage(flameImg, startClipX, 0, imgW, imgH, 261, this.flameY, 60, 90);
				
				game.canvas.ctx.drawImage(game.findImage("module_wl"),160,this.moduleY,263,324);
				
				this.moduleY += 1; // menime Y suradnicu
				this.flameY += 1;
				this.flameAnimCount += 0.4;

			}
			// modul pristal
			else if(this.step >= 287 && this.step < 310) {

				game.canvas.ctx.drawImage(game.findImage("module_wl"),160,this.moduleY,263,324);

			}
			// modul spustil rebrik
			else if(this.step >= 310 && this.step < 350) {

				game.canvas.ctx.drawImage(game.findImage("module"),160,this.moduleY,263,324);

			}
			// modul otvoril dvere a vysli z neho
			else if(this.step >= 350 && this.step < 405) { 

				game.canvas.ctx.drawImage(game.findImage("module_od"),160,this.moduleY,263,324);

				let el_startClipY = el_imgH * 2;
				let el_startClipX = el_imgW * 2;
				game.canvas.ctx.drawImage(electronImg, el_startClipX, el_startClipY, el_imgW, el_imgH, this.electronX, 350, el_imgW, el_imgH);

				let ph_startClipY = ph_imgH * 2;
				let ph_startClipX = ph_imgW * 3;
				game.canvas.ctx.drawImage(photonImg, ph_startClipX, ph_startClipY, ph_imgW, ph_imgH, this.photonX, 350, ph_imgW, ph_imgH);
			
			}
			// odchadzaju na stanicu
			else if(this.step >= 405 && this.step < 780) {

				game.canvas.ctx.drawImage(game.findImage("module_od"),160,this.moduleY,263,324);

				let el_startClipY = el_imgH * 1;
				let el_startClipX = el_imgW * (Math.floor(this.charactersAnimCount) % 8);
				game.canvas.ctx.drawImage(electronImg, el_startClipX, el_startClipY, el_imgW, el_imgH, this.electronX, 350, el_imgW, el_imgH);

				let ph_startClipY = ph_imgH * 1;
				let ph_startClipX = ph_imgW * (Math.floor(this.charactersAnimCount) % 8);
				game.canvas.ctx.drawImage(photonImg, ph_startClipX, ph_startClipY, ph_imgW, ph_imgH, this.photonX, 350, ph_imgW, ph_imgH);

				this.charactersAnimCount += 0.2;
				this.electronX += 2;
				this.photonX +=2;

			}
			// pada meteorit - panel cely
			else if(this.step >= 780 && this.step < 800) {

				text = "Avšak meteorit poškodil solárne panely, laserovú komunikáciu a dvere modulu.";

				game.canvas.ctx.drawImage(game.findImage("module_od"),160,this.moduleY,263,324);

				game.canvas.ctx.drawImage(game.findImage("meteor"),this.meteorX,this.meteorY,60,60);
				this.meteorX -= 16;
				this.meteorY += 12;
			}
			// pada meteorit - panel poskodeny
			else if(this.step >= 800 && this.step < 819) {

				text = "Avšak meteorit poškodil solárne panely, laserovú komunikáciu a dvere modulu.";

				game.canvas.ctx.drawImage(game.findImage("module_od_bp"),160,this.moduleY,263,324);

				game.canvas.ctx.drawImage(game.findImage("meteor"),this.meteorX,this.meteorY,60,60);
				this.meteorX -= 16;
				this.meteorY += 12;
			}
			// padnuty meteorit
			else if(this.step >= 819 && this.step < 840) {
				text = "Avšak meteorit poškodil solárne panely, laserovú komunikáciu a dvere modulu.";
				game.canvas.ctx.drawImage(game.findImage("module_od_bp"),160,this.moduleY,263,324);
				game.canvas.ctx.drawImage(game.findImage("meteor"),this.meteorX,this.meteorY,60,60);
			}
			// prichadzaju naspat
			else if(this.step >= 840 && this.step < 1120) {
				text = "Avšak meteorit poškodil solárne panely, laserovú komunikáciu a dvere modulu.";

				game.canvas.ctx.drawImage(game.findImage("module_od_bp"),160,this.moduleY,263,324);
				game.canvas.ctx.drawImage(game.findImage("meteor"),this.meteorX,this.meteorY,60,60);

				let el_startClipY = el_imgH * 0;
				let el_startClipX = el_imgW * (Math.floor(this.charactersAnimCount) % 8);
				game.canvas.ctx.drawImage(electronImg, el_startClipX, el_startClipY, el_imgW, el_imgH, this.electronX, 350, el_imgW, el_imgH);

				let ph_startClipY = ph_imgH * 0;
				let ph_startClipX = ph_imgW * (Math.floor(this.charactersAnimCount) % 8);
				game.canvas.ctx.drawImage(photonImg, ph_startClipX, ph_startClipY, ph_imgW, ph_imgH, this.photonX, 350, ph_imgW, ph_imgH);

				this.charactersAnimCount += 0.2;
				this.electronX -= 2;
				this.photonX -= 2;
			}
			else {
				text = "Musíte opraviť modul a splniť misiu, potom sa môžete vrátiť naspäť na Zem.";
				game.canvas.ctx.drawImage(game.findImage("module_od_bp"),160,this.moduleY,263,324);
				game.canvas.ctx.drawImage(game.findImage("meteor"),this.meteorX,this.meteorY,60,60);
				game.canvas.ctx.drawImage(electronImg,el_imgW*2,el_imgH*2,el_imgW,el_imgH,this.electronX,350,el_imgW,el_imgH);
				game.canvas.ctx.drawImage(photonImg,ph_imgW*2,ph_imgH*2,ph_imgW,ph_imgH,this.photonX,350,ph_imgW,ph_imgH);
			}

			game.canvas.ctx.drawImage(game.findImage("zem"),0,460,game.canvas.cW,80);

			// vypisanie textu
			game.canvas.ctx.fillStyle = "#000000";
			game.canvas.ctx.fillRect(0,0,800,50);
			game.canvas.ctx.font = "20px 'Ubuntu', sans-serif";
			game.canvas.ctx.fillStyle = "#ffffff";
			game.canvas.ctx.fillText(text,20,30);
			
			// animationframe
			this.request = window.requestAnimationFrame( () => {
				this.introduction(game);
			});

			this.step++; 

		}
		else{
			this.flameAnimCount = 0;
			this.step = 0;
			window.cancelAnimationFrame(this.request);
			this.introductionEnd(game);
		}

	}

	introductionEnd(game) {
		game.start();
	}


	/******************** PASSAGE STAGE1 SCENE ****************************/
	passage_stage1(game) {

		window.cancelAnimationFrame(game.request);
		game.world.player.controlBlock = true;

		let text = "";
		game.canvas.ctx.drawImage(game.findImage("module_indoor"),0,0,game.canvas.cW,game.canvas.cH);

		if(this.step < 500){

			if(this.step < 200) {
				game.canvas.ctx.drawImage(game.findImage("module_panels"),0,0,800,500,0,0,game.canvas.cW,game.canvas.cH);
			}
			else {

				let startClipX = 800 + (800 * (Math.floor(this.panelsAnimCount) % 2));
				game.canvas.ctx.drawImage(game.findImage("module_panels"),startClipX,0,800,500,0,0,game.canvas.cW,game.canvas.cH);
				text = "Výborne! Máte energiu.";

				this.panelsAnimCount += 0.05;

			}

			game.canvas.ctx.drawImage(game.findImage("module_chairs"),0,0,game.canvas.cW,game.canvas.cH);

			// vypisanie textu
			game.canvas.ctx.fillStyle = "#000000";
			game.canvas.ctx.fillRect(0,0,800,50);
			game.canvas.ctx.font = "20px 'Ubuntu', sans-serif";
			game.canvas.ctx.fillStyle = "#ffffff";
			game.canvas.ctx.fillText(text,310,30);
			
			this.step++;

			this.request = window.requestAnimationFrame( () => {
				this.passage_stage1(game);
			});

		}
		else{
			this.step = 0;
			window.cancelAnimationFrame(this.request);
			this.end(game);
		}

	}


	/******************** PASSAGE STAGE2 SCENE ****************************/
	passage_stage2(game) {

		window.cancelAnimationFrame(game.request);
		game.world.player.controlBlock = true;

		let text = "";

		game.canvas.ctx.drawImage(game.findImage("communication"),0,0,game.canvas.cW,game.canvas.cH);

		game.canvas.ctx.font = "bold 14px 'Ubuntu', sans-serif";
		game.canvas.ctx.fillStyle = "#000000";
		game.canvas.ctx.fillText("Spojenie so základňou",310,205);

		if(this.step < 850){

			if(this.step < 100) {
				game.canvas.ctx.font = "bold 16px 'Ubuntu', sans-serif";
				game.canvas.ctx.fillStyle = "#000000";
				game.canvas.ctx.fillText("ŽIADNY SIGNÁL",320,250);
			}
			else if(this.step >= 200 && this.step < 300) {
				game.canvas.ctx.font = "bold 16px 'Ubuntu', sans-serif";
				game.canvas.ctx.fillStyle = "#000000";
				game.canvas.ctx.fillText("ŽIADNY SIGNÁL",320,250);
			}
			else if(this.step >= 400 && this.step < 500) {
				game.canvas.ctx.font = "bold 16px 'Ubuntu', sans-serif";
				game.canvas.ctx.fillStyle = "#000000";
				game.canvas.ctx.fillText("ŽIADNY SIGNÁL",320,250);
			}
			else if(this.step >= 500 && this.step < 650) {
				game.canvas.ctx.font = "bold 14px 'Ubuntu', sans-serif";
				game.canvas.ctx.fillStyle = "#000000";
				game.canvas.ctx.fillText("KOMUNIKÁCIA BOLA OBNOVENÁ",280,250);
				text = "Super! Opravili ste laserovú komunikáciu.";
			}
			else if(this.step >= 650 && this.step <= 850) {
				game.canvas.ctx.font = "bold 12px 'Ubuntu', sans-serif";
				game.canvas.ctx.fillStyle = "#000000";
				game.canvas.ctx.fillText("ZAKL: M9596 tu základňa ste na prijme?",220,240);
				text = "Super! Opravili ste laserovú komunikáciu.";
			}

			// vypisanie textu
			game.canvas.ctx.fillStyle = "#000000";
			game.canvas.ctx.fillRect(0,0,800,50);
			game.canvas.ctx.font = "20px 'Ubuntu', sans-serif";
			game.canvas.ctx.fillStyle = "#ffffff";
			game.canvas.ctx.fillText(text,170,30);
			
			this.step++;

			this.request = window.requestAnimationFrame( () => {
				this.passage_stage2(game);
			});

		}
		else{
			this.step = 0;
			window.cancelAnimationFrame(this.request);
			this.end(game);
		}

	}


	/******************** DRIVING CAR SCENE ******************************/
	drivingCar_scene(game) {

		window.cancelAnimationFrame(game.request);
		game.world.player.controlBlock = true;

		game.canvas.ctx.drawImage(game.findImage("stage0_bg"),0,0,game.canvas.cW,game.canvas.cH);
		game.canvas.ctx.drawImage(game.findImage("meteor"),this.stoneX,390,100,100);
		game.canvas.ctx.drawImage(game.findImage("zem"),0,460,game.canvas.cW,20);
		game.canvas.ctx.drawImage(game.findImage("solar_panels"),this.solarPanelsX,352,300,120);
		game.canvas.ctx.drawImage(game.findImage("station"),this.stationX,30,1900,430);
		game.canvas.ctx.drawImage(game.findImage("rover_wp"),0,0,230,135,200,325,230,135);

		if(this.step < 850){

			let wheelImg = game.findImage("rover_wheel");
			let startClipX = (wheelImg.width/8) * (Math.floor(this.wheelAnimCount) % 8);
			game.canvas.ctx.drawImage(wheelImg,startClipX,0,wheelImg.width/8,wheelImg.height,208,409,51,51);
			game.canvas.ctx.drawImage(wheelImg,startClipX,0,wheelImg.width/8,wheelImg.height,355,409,51,51);

			this.wheelAnimCount += 0.3;
			this.stationX = this.stationX-4;
			this.solarPanelsX = this.solarPanelsX-4;
			this.stoneX = this.stoneX-4;
			this.step++;

			this.request = window.requestAnimationFrame( () => {
				this.drivingCar_scene(game);
			});

		}
		else{
			this.step = 0;
			window.cancelAnimationFrame(this.request);
			game.world.player.setPosition(5000,320);
			game.canvas.setStartDrawX(4700);
			this.end(game);
		}

	}


	/******************** DRIVING CAR BACK SCENE *************************/
	drivingCarBack_scene(game) {
		
		window.cancelAnimationFrame(game.request);
		game.world.player.controlBlock = true;

		game.canvas.ctx.drawImage(game.findImage("stage0_bg"),0,0,game.canvas.cW,game.canvas.cH);
		game.canvas.ctx.drawImage(game.findImage("meteor"),this.stoneX,390,100,100);
		game.canvas.ctx.drawImage(game.findImage("zem"),0,460,game.canvas.cW,20);
		game.canvas.ctx.drawImage(game.findImage("solar_panels"),this.solarPanelsX,352,300,120);
		game.canvas.ctx.drawImage(game.findImage("station"),this.stationX,30,1900,430);
		game.canvas.ctx.drawImage(game.findImage("rover_wp"),230,0,230,135,200,325,230,135);

		if(this.step < 950){

			if(this.step < 850){

				let wheelImg = game.findImage("rover_wheel");
				let startClipX = (wheelImg.width/8) * (Math.floor(this.wheelAnimCount) % 8);
				game.canvas.ctx.drawImage(wheelImg,startClipX,0,wheelImg.width/8,wheelImg.height,225,409,51,51);
				game.canvas.ctx.drawImage(wheelImg,startClipX,0,wheelImg.width/8,wheelImg.height,370,409,51,51);
				
				this.wheelAnimCount -= 0.3;
				this.stationX = this.stationX+4;
				this.solarPanelsX = this.solarPanelsX+4;
				this.stoneX = this.stoneX+4;

			}
			else {
				let wheelImg = game.findImage("rover_wheel");
				game.canvas.ctx.drawImage(wheelImg,0,0,wheelImg.width/8,wheelImg.height,225,409,51,51);
				game.canvas.ctx.drawImage(wheelImg,0,0,wheelImg.width/8,wheelImg.height,370,409,51,51);
			}

			this.step++;

			this.request = window.requestAnimationFrame( () => {
				this.drivingCarBack_scene(game);
			});

		}
		else{
			this.step = 0;
			window.cancelAnimationFrame(this.request);
			game.world.player.setPosition(1100,320);
			game.canvas.setStartDrawX(750);
			this.end(game);
		}

	}

	/************************* HAPPY END SCENE ***************************/
	happyEnd(game) {

		window.cancelAnimationFrame(game.request);
		game.world.player.controlBlock = true;

		let text = "Splnili ste misiu a môžete sa vrátiť naspäť na Zem.";

		// vykreslienie zakladnych obrazkov (kt sa nemenia)
		game.canvas.ctx.drawImage(game.findImage("stage0_bg"),0,0,game.canvas.cW,game.canvas.cH);
		game.canvas.ctx.drawImage(game.findImage("flag"),430,325,120,130);
		game.canvas.ctx.drawImage(game.findImage("solar_panels"),620,352,300,120);
		game.canvas.ctx.font = "20px 'Ubuntu', sans-serif";
		game.canvas.ctx.fillStyle = "#ffffff";

		if(this.step < 650){

			if(this.step < 50) {
				game.canvas.ctx.drawImage(game.findImage("module_od"),160,this.moduleY,263,324);
			}
			else if(this.step >= 50 && this.step < 100) {
				game.canvas.ctx.drawImage(game.findImage("module_wl"),160,this.moduleY,263,324);
			}
			else {

				let flameImg = game.findImage("flame");
				let imgW = flameImg.width/3;
				let imgH = flameImg.height;
				let startClipX = imgW * (Math.floor(this.flameAnimCount) % 3);
				game.canvas.ctx.drawImage(flameImg, startClipX, 0, imgW, imgH, 261, this.flameY, 60, 90);
				
				game.canvas.ctx.drawImage(game.findImage("module_wl"),160,this.moduleY,263,324);
				
				this.moduleY -= 1.2; // menime Y suradnicu
				this.flameY -= 1.2;
				this.flameAnimCount += 0.4;

			}

			game.canvas.ctx.drawImage(game.findImage("zem"),0,460,game.canvas.cW,80);

			// vypisanie textu
			game.canvas.ctx.fillStyle = "#000000";
			game.canvas.ctx.fillRect(0,0,800,50);
			game.canvas.ctx.font = "20px 'Ubuntu', sans-serif";
			game.canvas.ctx.fillStyle = "#ffffff";
			game.canvas.ctx.fillText(text,170,30);

			this.step++;

			this.request = window.requestAnimationFrame( () => {
				this.happyEnd(game);
			});

		}
		else{
			this.step = 0;
			window.cancelAnimationFrame(this.request);
			this.end(game);
			game.end("win");
		}

		
	}

}