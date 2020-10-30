/* **************************************************************************************** */
/* *********************************** Class Item ***************************************** */
/* **************************************************************************************** */

class Item extends Sprite {

	constructor(name,text,laserType,type,x,y,w,h,img) {
		super(w,h,x,y,img,0,0,0,0,1);
		this.name = name;
		this.text = text;
		this.laserType = laserType;
		this.type = type;
	}

	render(ctx) {
		ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
		ctx.font = "bold 14px 'Calibri'";
		ctx.fillStyle = "#000000";
		ctx.fillText(this.text,this.x+5,this.y+25);
	}

}


/* **************************************************************************************** */
/* *********************************** Class Basket *************************************** */
/* **************************************************************************************** */

class Basket extends Sprite {

	constructor(x,y,w,h,img) {
		super(w,h,x,y,img,0,0,0,0,1);
		this.type = "";
		this.items = [];
		this.itemTypes = ["typ", "vykon", "dlzka", "svetlo", "full"];
		this.nextItemType = this.itemTypes[0];
	}

	addItem(item) {

		item.setPosition(this.x+5,item.y);

		if(this.items.length > 0) {
			item.y = this.items[this.items.length-1].y - (item.height+4);
		}
		else {
			item.y = (this.y + this.height) - (item.height + 4);
		}

		this.items.push(item);

	}

	nextItemTypeSet() {

		let index = -1;

		this.itemTypes.forEach((type,i) => {
			if(type == this.nextItemType) index = i;
		});

		if(index >= 0) this.nextItemType = this.itemTypes[index+1];

	}

	isEmpty() {
		if(this.items.length <= 0) return true;
		return false;
	}

	render(ctx) {

		ctx.drawImage(this.img,this.x,this.y,this.width,this.height);

		this.items.forEach((item) => {
			item.render(ctx);
		});

	}

}


/* **************************************************************************************** */
/* ******************************** Class LaserTypesQuest ********************************* */
/* **************************************************************************************** */

class LaserTypesQuest extends MiniGame {

	constructor(game,name,MGobj) {

		let tasksForPlayer = 8;
		let infoImg = game.findImage("LaserTypesQuest_Info");
		super(name,MGobj,game.canvas,tasksForPlayer,[infoImg]);

		this.questComplete = false;

		this.bgImg = game.findImage("LaserTypesQuest_bg");
		this.description = "Správne vyplňte koše prvkami z poľa.";

		let basketImg = game.findImage("basket");
		this.baskets = [
							new Basket(150,250,110,200,basketImg),
							new Basket(268,250,110,200,basketImg),
							new Basket(386,250,110,200,basketImg),
							new Basket(504,250,110,200,basketImg)
						];

		this.items = [];

		this.snappedItem = null;

		this.createItems(game);
		this.shuffle();

		this.control(game);

	}

	load(game) {
		this.text = "";
	}

	createItems(game) {

		let itemImg = game.findImage("item");
		this.items.push( new Item("typL1","ukazovátko","laser1","typ",0,0,100,40,itemImg) );
		this.items.push( new Item("vykonL1","1mW","laser1","vykon",0,0,100,40,itemImg) );
		this.items.push( new Item("dlzkaL1","532nm","laser1","dlzka",0,0,100,40,itemImg) );
		this.items.push( new Item("svetloL1","zelené","laser1","svetlo",0,0,100,40,itemImg) );
		this.items.push( new Item("typL2","zameriavač","laser2","typ",0,0,100,40,itemImg) );
		this.items.push( new Item("vykonL2","50mW","laser2","vykon",0,0,100,40,itemImg) );
		this.items.push( new Item("dlzkaL2","630-680nm","laser2","dlzka",0,0,100,40,itemImg) );
		this.items.push( new Item("svetloL2","červené","laser2","svetlo",0,0,100,40,itemImg) );
		this.items.push( new Item("typL3","Projektory","laser3","typ",0,0,100,40,itemImg) );
		this.items.push( new Item("vykonL3","1400mW","laser3","vykon",0,0,100,40,itemImg) );
		this.items.push( new Item("dlzkaL3","457nm","laser3","dlzka",0,0,100,40,itemImg) );
		this.items.push( new Item("svetloL3","modré","laser3","svetlo",0,0,100,40,itemImg) );
		this.items.push( new Item("typL4","Opt. komunikácie","laser4","typ",0,0,100,40,itemImg) );
		this.items.push( new Item("vykonL4","5mW","laser4","vykon",0,0,100,40,itemImg) );
		this.items.push( new Item("dlzkaL4","1550nm","laser4","dlzka",0,0,100,40,itemImg) );
		this.items.push( new Item("svetloL4","IR-neviditeľné","laser4","svetlo",0,0,100,40,itemImg) );

	}

	shuffle() {

		/*************** RANDOM SET ****************/

		for(let i=0; i<this.items.length; i++) {
			let randomIndex = Math.floor(Math.random() * 100)%(16-i);
			let removedItem = this.items[randomIndex];
			this.items.splice(randomIndex,1);
			this.items.push(removedItem);
		}

		this.items.forEach((item,i) => {

			if((i%4) == 0) item.setPosition(160,item.y);
			else if((i%4) == 1) item.setPosition(265,item.y);
			else if((i%4) == 2) item.setPosition(370,item.y);
			else if((i%4) == 3) item.setPosition(475,item.y);

			if(i < 4) item.setPosition(item.x,45);
			else if(i >= 4 && i < 8) item.setPosition(item.x,90);
			else if(i >= 8 && i < 12) item.setPosition(item.x,135);
			else if(i >= 12) item.setPosition(item.x,180);

		});

	}

	control(game) {
		
		/*********************** CLICK ********************************************/

		this.canvas.element.addEventListener('click', (event) => {

			if(!this.controlBlock) {
				
				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				this.clickButton(game,click_x,click_y);

			}		
		});


		/*********************** MOUSE DOWN ***************************************/

		this.canvas.element.addEventListener('mousedown', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				// zisti ci je na danej pozici nejaky objekt
				this.items.forEach((item) => {

					if(click_x >= item.x && click_x <= (item.x + item.width) && click_y >= item.y && click_y <= (item.y + item.height)) {
						this.snappedItem = item;
						this.itemPrevX = item.x; // x suradnica pred presunutim 
						this.itemPrevY = item.y; // y suradnica pred presunutim 
					}

				});

			}

		});


		/*********************** MOUSE UP *****************************************/

		this.canvas.element.addEventListener('mouseup', (event) => {

			if(!this.controlBlock) {

				if(this.snappedItem != null) {

					var rect = this.canvas.element.getBoundingClientRect();
					var click_x = event.clientX - rect.left;
					var click_y = event.clientY - rect.top;

					var itemReturn = true;

					if(this.solvedTasks < this.NumTasksForPlayer) {

						// ci existuje uz nejaky kos ktory ma typ ako snappnuty item
						let basketTypeExist = this.baskets.filter((basket) => { return basket.type == this.snappedItem.laserType; }).length > 0;

						if(this.baskets[0].nextItemType == this.snappedItem.type && ( (this.baskets[0].isEmpty() && !basketTypeExist)  || this.snappedItem.laserType == this.baskets[0].type)) {

							if (click_x >= this.baskets[0].x && click_x <= (this.baskets[0].x + this.baskets[0].width) && click_y >= this.baskets[0].y && click_y <= (this.baskets[0].y + this.baskets[0].height)) {
							
								if(this.baskets[0].isEmpty()) this.baskets[0].type = this.snappedItem.laserType;
								game.socket.emit('pin item', { itemName: this.snappedItem.name, basketIndex: 0 } ); // odoslanie spravy na server
								this.items = this.items.filter((item) => { return item.name != this.snappedItem.name; }); // odstrani item z items
								this.baskets[0].addItem(this.snappedItem); // prida vec do kosa
								this.baskets[0].nextItemTypeSet();
								this.solvedTasks++;
								itemReturn = false;

							}

						}
						
						if(this.baskets[1].nextItemType == this.snappedItem.type && ( (this.baskets[1].isEmpty() && !basketTypeExist)  || this.snappedItem.laserType == this.baskets[1].type)) {

							if (click_x >= this.baskets[1].x && click_x <= (this.baskets[1].x + this.baskets[1].width) && click_y >= this.baskets[1].y && click_y <= (this.baskets[1].y + this.baskets[1].height)) {
							
								if(this.baskets[1].isEmpty()) this.baskets[1].type = this.snappedItem.laserType;
								game.socket.emit('pin item', { itemName: this.snappedItem.name, basketIndex: 1 } ); // odoslanie spravy na server
								this.items = this.items.filter((item) => { return item.name != this.snappedItem.name; }); // odstrani item z items
								this.baskets[1].addItem(this.snappedItem); // prida vec do kosa
								this.baskets[1].nextItemTypeSet();
								this.solvedTasks++;
								itemReturn = false;

							}

						}
						
						if(this.baskets[2].nextItemType == this.snappedItem.type && ( (this.baskets[2].isEmpty() && !basketTypeExist)  || this.snappedItem.laserType == this.baskets[2].type)) {

							if (click_x >= this.baskets[2].x && click_x <= (this.baskets[2].x + this.baskets[2].width) && click_y >= this.baskets[2].y && click_y <= (this.baskets[2].y + this.baskets[2].height)) {
							
								if(this.baskets[2].isEmpty()) this.baskets[2].type = this.snappedItem.laserType;
								game.socket.emit('pin item', { itemName: this.snappedItem.name, basketIndex: 2 } ); // odoslanie spravy na server
								this.items = this.items.filter((item) => { return item.name != this.snappedItem.name; }); // odstrani item z items
								this.baskets[2].addItem(this.snappedItem); // prida vec do kosa
								this.baskets[2].nextItemTypeSet();
								this.solvedTasks++;
								itemReturn = false;

							}

						}
						
						if(this.baskets[3].nextItemType == this.snappedItem.type && ( (this.baskets[3].isEmpty() && !basketTypeExist)  || this.snappedItem.laserType == this.baskets[3].type)) {

							if (click_x >= this.baskets[3].x && click_x <= (this.baskets[3].x + this.baskets[3].width) && click_y >= this.baskets[3].y && click_y <= (this.baskets[3].y + this.baskets[3].height)) {
							
								if(this.baskets[3].isEmpty()) this.baskets[3].type = this.snappedItem.laserType;
								game.socket.emit('pin item', { itemName: this.snappedItem.name, basketIndex: 3 } ); // odoslanie spravy na server 
								this.items = this.items.filter((item) => { return item.name != this.snappedItem.name; }); // odstrani item z items
								this.baskets[3].addItem(this.snappedItem); // prida vec do kosa
								this.baskets[3].nextItemTypeSet();
								this.solvedTasks++;
								itemReturn = false;

							}

						}
						
						// ak itemReturn == true tak ju vrati na povodne miesto
						if(itemReturn) { 
							this.snappedItem.setPosition(this.itemPrevX,this.itemPrevY);
						}

						// pusti predmet
						this.snappedItem = null;

					}
					else {
						this.snappedItem.setPosition(this.itemPrevX,this.itemPrevY);
						this.snappedItem = null;
					}


				}

			}


		});


		/*********************** MOUSE MOVE ***************************************/

		this.canvas.element.addEventListener('mousemove', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var cursorPosX = event.clientX - rect.left;
				var cursorPosY = event.clientY - rect.top;

				if(this.snappedItem != null) {
					this.snappedItem.setPosition(cursorPosX - 50,cursorPosY - 10);
				}

			}

		});

	}

	checkDone() {
		let fullBaskets = this.baskets.filter((basket) => { return basket.nextItemType == "full"; });
		if(fullBaskets.length == this.baskets.length) {
			this.confirm_button.activate();
			this.questComplete = true;
		}
	}

	win(game) {
		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.world.player.controlBlock = false; // odblokuje ovladanie hry
		game.gameLoop();
		game.world.stage.getObjectByName("door3").open();
		let trigger = game.world.stage.getObjectByName("door3_trigger");
		game.world.stage.deleteObject(trigger);
	}

	render() {

		this.preRender();

		this.baskets.forEach((basket) => {
			basket.render(this.canvas.ctx);
		});

		this.items.forEach((item) => {
			item.render(this.canvas.ctx);
		});

		// vypisanie textu
		this.canvas.ctx.font = "20px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";
		this.canvas.ctx.fillText(this.description,190,22); 

		if(!this.questComplete && this.solvedTasks >= this.NumTasksForPlayer) {
			this.canvas.ctx.font = "bold 18px 'Ubuntu', sans-serif";
			this.canvas.ctx.fillStyle = "#f21010";
			this.canvas.ctx.fillText("Správne si vyplnil polovicu neznámych, ostatné musí vyplniť tvoj spoluhráč.",50,480);
		}

	}

}