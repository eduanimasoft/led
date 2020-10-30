/* **************************************************************************************** */
/* *********************************** Class Zone ***************************************** */
/* **************************************************************************************** */

class Zone extends Sprite {

	constructor(x,y,w,h,image,maxObjects,allowedArray) {
		super(w,h,x,y,image,0,0,0,0,1);
		this.full = false;
		this.maxObjects = maxObjects;
		this.allowedArray = allowedArray;
		this.objects = [];
	}

	addObject(object) {
		this.objects.push(object);
		if(this.objects.length >= this.maxObjects)
			this.full = true;
	}

	isFull() {
		if(this.full) 
			return true;
		return false;
	}

	isAllowed(object) {

		let allow = false;

		this.allowedArray.forEach((allowed) => {
			if(allowed == object.name) allow = true;
		});

		return allow;

	}

	on(x,y) {

		if(x > this.x && x < (this.x + this.width) && y > this.y && y < (this.y + this.height)) {
			return true;
		}

		return false;

	}

	render(ctx) {

		if(this.visible == 1) {

			ctx.drawImage(this.img,this.x,this.y,this.width,this.height);

			this.objects.forEach((obj) => {
				obj.renderInventory(ctx);
			});

		}

	}

}


/* **************************************************************************************** */
/* ****************************** Class ChooseCorrectQuest ******************************** */
/* **************************************************************************************** */

class ChooseCorrectQuest extends MiniGame {

	constructor(game,name,MGobj) {
	
		let tasksForPlayer = 1;
		let infoImg = game.findImage("ChooseCorrectQuest_Info");
		super(name,MGobj,game.canvas,tasksForPlayer,[infoImg]);

		this.bgImg = game.findImage("minigame_bg");
		this.description = "Z možností vyberte aplikácie LED diód.";

		let zoneImg = game.findImage("zone");
		this.zone = new Zone(260,110,280,280,zoneImg,4,["semafor","TVovladac","LED_baterka","podsvietenie_obrazovky"]);

		this.objects = [
						 new GameObject("semafor","semafor","semafór",100,100,100,80,game.findImage("semafor_LA"),0,0,0,0,1),
						 new GameObject("solarny_clanok","solarny_clanok","solárny článok",100,100,100,200,game.findImage("solarny_clanok_LA"),0,0,0,0,1),
						 new GameObject("TVovladac","TVovladac","TV ovládač",100,100,100,320,game.findImage("TVovladac_LA"),0,0,0,0,1),
						 new GameObject("modry_laser","modry_laser","modrý laser",100,100,600,80,game.findImage("modry_laser_LA"),0,0,0,0,1),
						 new GameObject("LED_baterka","LED_baterka","LED baterka",100,100,600,200,game.findImage("LEDbaterka_LA"),0,0,0,0,1),
						 new GameObject("podsvietenie_obrazovky","podsvietenie_obrazovky","podsvietenie obrazovky",100,100,600,320,game.findImage("obrazovka_LA"),0,0,0,0,1)
						];

		this.snappedObject = null;

		this.control(game);

	}

	control(game) {

		/*********************** MOUSE DOWN ***************************************/

		this.canvas.element.addEventListener('mousedown', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				this.snapObject(click_x,click_y);

			}

		});


		/*********************** MOUSE MOVE **************************************/

		this.canvas.element.addEventListener('mousemove', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var cursorPosX = event.clientX - rect.left;
				var cursorPosY = event.clientY - rect.top;

				this.moveSnappedObject(cursorPosX,cursorPosY);
			}

		});


		/*********************** MOUSE UP *****************************************/

		this.canvas.element.addEventListener('mouseup', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				if(this.snappedObject != null) {

					if(this.zone.on(click_x,click_y) && this.zone.isAllowed(this.snappedObject)) {
						this.goal(this.snappedObject);
						game.socket.emit('goal', { objName: this.snappedObject.name, objX: this.snappedObject.x, objY: this.snappedObject.y });
					}
					else {
						this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
					}

					// pusti predmet
					this.snappedObject = null;

				}

			}

		});


		/*********************** CLICK ********************************************/

		this.canvas.element.addEventListener('click', (event) => {

			if(!this.controlBlock) {
				
				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				this.clickButton(game,click_x,click_y);

			}

		});

	}

	goal(object) {
		this.zone.addObject(object);
		this.deleteObject(object.name);
	}

	getObject(objName) {
		let returnObj = this.objects.filter((obj) => { return obj.name == objName; });
		return returnObj[0];
	}

	deleteObject(objName) {
		let pos = -1;

		this.objects.forEach((obj,i) => {
			if(obj.name == objName) pos = i;
		});

		if(pos != -1) this.objects.splice(pos,1);
	}

	confirm(game) {
		game.socket.emit('quest done');
		game.socket.emit('mine');
		let arcikanImg = game.findImage("arcikan");
		game.world.stage.objects.push( new GameObject("arcikan","arcikan","nerast",50,50,5700,390,arcikanImg,0,0,0,1,1) );
		this.win(game);
	}

	checkDone() {
		if(this.zone.isFull()) 
			this.confirm_button.activate();
	}

	win(game) {
		
		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.world.player.controlBlock = false; // odblokuje ovladanie hry
		game.gameLoop();

		let trigger = game.world.stage.getObjectByName("mining_machine_trigger");
		game.world.stage.deleteObject(trigger);

		game.world.stage.mission = "Výborne. Zoberte vyťažený nerast, opravte dvere na module a môžete sa vrátiť naspäť na Zem.";

	}

	render() {
		
		this.preRender();

		this.canvas.ctx.font = "bold 18px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";
		this.canvas.ctx.fillText(this.description,245,28);

		this.zone.render(this.canvas.ctx);

		this.objects.forEach((object) => {
			object.renderInventory(this.canvas.ctx);
			this.canvas.ctx.font = "bold 14px 'Ubuntu', sans-serif";
			this.canvas.ctx.fillStyle = "#000000";
			this.canvas.ctx.fillText(object.description,object.x,object.y+115);
		});

	}

}