/* **************************************************************************************** */
/* ************************************* Class MiniGame *********************************** */
/* **************************************************************************************** */

class MiniGame {

	constructor(name,MGobj,canvas,numoftasks,infoImgs) {

		this.name = name;
		this.MGobject = MGobj; // na aky objekt sa uloha (minihra) viaze
		this.request = undefined;
		this.canvas = canvas;
		this.NumTasksForPlayer = numoftasks;
		this.controlBlock = true;
		this.solvedTasks = 0;

		let activeConfirmButton_img = game.findImage("active_confirm_button");
		let inactiveConfirmButton_img = game.findImage("inactive_confirm_button");
		this.confirm_button = new Button("confirm",null,false,710,410,80,80,activeConfirmButton_img,inactiveConfirmButton_img);
		let exitButton_img = game.findImage("exit_button");
		this.exit_button = new Button("exit",null,true,766,2,30,30,exitButton_img,null);

		if(infoImgs != null) {
			let infoButton_img = game.findImage("info_button");
			this.info_button = new Button("info",null,true,730,2,30,30,infoButton_img,null);
			this.infoPage = new InfoPage(game,this.canvas.cW,this.canvas.cH,0,0,infoImgs);
		}
		else {
			this.info_button = null;
			this.infoPage = null;
		}

		// fps
		this.maxFPS = 30;
		this.interval = 1000/this.maxFPS;
		this.lastFrameTime = Date.now();

	}

	go(game) {
		this.load(game);
		this.controlBlock = false;
		game.world.player.controlBlock = true;
		window.cancelAnimationFrame(game.request);
		this.gameLoop();
	}

	load(game) {

	}

	checkDone() {

	}

	snapObject(click_x,click_y) {

		// zisti ci je na danej pozici nejaky objekt
		this.objects.forEach((object) => {

			if(click_x >= object.x && click_x <= (object.x + object.width) && click_y >= object.y && click_y <= (object.y + object.height)) {
				this.snappedObject = object;
				this.objPrevX = object.x; // x suradnica pred presunutim 
				this.objPrevY = object.y; // y suradnica pred presunutim 
			}

		});

	}

	moveSnappedObject(cursorPosX,cursorPosY) {
		if(this.snappedObject != null) 
			this.snappedObject.setPosition(cursorPosX - 25, cursorPosY - 25);
	}

	clickButton(game,click_x,click_y) {

		// klikol na exit
		if(this.exit_button.click(click_x,click_y)) {
			game.socket.emit('back to game', game.socket.id);
			window.cancelAnimationFrame(this.request);
			this.controlBlock = true; // zablokuje ovladanie minihry
			game.world.player.controlBlock = false; // odblokuje ovladanie hry
			game.gameLoop();
		}

		// klikol na info button
		if(this.info_button != null) {

			if(this.info_button.click(click_x,click_y)) {
				cancelAnimationFrame(this.request);
				this.controlBlock = true; 
				this.infoPage.controlBlock = false;;
				this.infoPage.render(this.canvas.ctx);
			}

		}

		// klikol na potvrdit
		if(this.confirm_button.active && this.confirm_button.click(click_x,click_y)) {
			this.confirm(game);
		}

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
		this.win(game);
	}

	gameLoop() {

		let now = Date.now();
		let delta = now - this.lastFrameTime;

		if(delta > this.interval) {
			this.lastFrameTime = now - (delta % this.interval);
			this.checkDone();
			this.render();
		}

		this.request = window.requestAnimationFrame(this.gameLoop.bind(this));

	}

	preRender() {

		this.canvas.ctx.clearRect(0,0,this.canvas.cW,this.canvas.cH);

		// vykreslenie background-u
		this.canvas.ctx.drawImage(this.bgImg,0,0,this.canvas.cW,this.canvas.cH);

		// vykreslenie buttonov
		if(this.exit_button != null) this.exit_button.render(this.canvas.ctx);
		if(this.info_button != null) this.info_button.render(this.canvas.ctx);
		if(this.confirm_button != null) this.confirm_button.render(this.canvas.ctx);

	}

}


/* **************************************************************************************** */
/* ********************************** Class Spot ****************************************** */
/* **************************************************************************************** */

class Spot extends Sprite {

	constructor(img,spotFor,x,y,w,h) {
		
		super(w,h,x,y,img,0,0,0,0,1);
		this.spotFor = spotFor;
		this.pinned = null;

	}

	pin(object) {
		this.pinned = object;
	}

}


/* **************************************************************************************** */
/* ********************************* Class InfoPage *************************************** */
/* **************************************************************************************** */

class InfoPage {

	constructor(game,w,h,x,y,pages) {
		
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.pages = pages;
		this.controlBlock = true;
		this.pageNum = 1;
		this.numOfPages = pages.length;

		let goBackButton_img = game.findImage("goBack_button");
		this.exit_button = new Button("goBack",null,true,0,0,30,30,goBackButton_img,null);

		this.previous_button = null;
		this.next_button = null;

		if(this.pages.length > 1) {
			let prevB_img = game.findImage("previous_button");
			this.previous_button = new Button("previous",null,true,340,440,30,30,prevB_img,null);
			let nextB_img = game.findImage("next_button");
			this.next_button = new Button("next",null,true,430,440,30,30,nextB_img,null);
		}

		this.control(game);

	}

	control(game) {

		game.canvas.element.addEventListener('click', (event) => {

			if(!this.controlBlock) {

				var rect = game.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				// klikol na exit
				if(this.exit_button.click(click_x,click_y)) {
					this.controlBlock = true; // zablokuje ovladanie 
					game.world.stage.quest.controlBlock = false; // odblokuje ovladanie minihry
					game.world.stage.quest.gameLoop(game); // zapne gameLoop minihry
				}

				// klikol na next
				if(this.next_button != null && this.next_button.click(click_x,click_y)) {
					
					if(this.pageNum < this.numOfPages) {
						this.pageNum++;
						this.render(game.canvas.ctx);
					}
					
				}

				// klikol na previous
				if(this.previous_button != null && this.previous_button.click(click_x,click_y)) {
					
					if(this.pageNum > 1) {
						this.pageNum--;
						this.render(game.canvas.ctx);
					}

				}

			}

		});

	}

	render(ctx) {

		ctx.drawImage(this.pages[this.pageNum-1],this.x,this.y,this.width,this.height);
		this.exit_button.render(ctx);
		
		if(this.next_button != null && this.previous_button != null) {
			
			this.next_button.render(ctx);
			this.previous_button.render(ctx);

			ctx.font = "bold 25px 'Ubuntu', sans-serif";
			ctx.fillStyle = "#000000";
			ctx.fillText(this.pageNum+"/"+this.numOfPages,380,463);

		}

	}

}


/* **************************************************************************************** */
/* ****************************** Class FixCircuitMiniGame ******************************** */
/* **************************************************************************************** */

class FixCircuitMiniGame extends MiniGame {

	constructor(game,name,MGobj,canvas,bgImg,infoImg) {

		let tasksForPlayer = 3;
		super(name,MGobj,canvas,tasksForPlayer,infoImg);
		this.bgImg = bgImg;
		this.objects = [];
		this.questDone = [false, false, false, false, false, false];
		// 0- solar panel, 1- regulator, 2- ACdevice, 3- accumulator1, 4- accumulator2, 5- converter
		this.questComplete = false;

		this.spot1_fill = null;
		this.spot2_fill = null;
		this.spot3_fill = null;
		this.spot4_fill = null;
		this.spot5_fill = null;
		this.spot6_fill = null;

		this.snappedObject = null;

		this.control(game);

	}

	load(game) {

		this.objects = [];
		
		for(let i = 0; i < game.world.player.inventory.items.length; i++) {
			this.objects[i] = game.world.player.inventory.items[i];
			this.objects[i].setPosition(350+(i*(this.objects[i].width+50)),420);
		}

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


		/*********************** MOUSE UP *****************************************/

		this.canvas.element.addEventListener('mouseup', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				// ak bol nejaky objekt chyteny a klikol tak sa zisti ci na spravny spot ak ano zostane tam inak sa vrati s5
				if(this.snappedObject != null) {

					if(this.snappedObject.name == this.spot1_objectName) {

						// ak je umiestneny na spravny spot
						if(this.solvedTasks < this.NumTasksForPlayer  && this.questDone[0] == false && click_x >= this.spot1.x && click_x <= (this.spot1.x + this.spot1.width) && click_y >= this.spot1.y && click_y <= (this.spot1.y + this.spot1.height)) {
							
							game.socket.emit('task done', { sid: game.socket.id, task: this.spot1_objectName }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name); // vymazat aj z inventara hraca
							this.taskDone(game,this.spot1_objectName); 
							this.solvedTasks++;

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

					}
					else if(this.snappedObject.name == this.spot2_objectName) {

						// ak je umiestneny na spravny spot
						if(this.solvedTasks < this.NumTasksForPlayer  && this.questDone[1] == false && click_x >= this.spot2.x && click_x <= (this.spot2.x + this.spot2.width) && click_y >= this.spot2.y && click_y <= (this.spot2.y + this.spot2.height)) {
							
							game.socket.emit('task done', { sid: game.socket.id, task: this.spot2_objectName }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name); // vymazat aj z inventara hraca
							this.taskDone(game,this.spot2_objectName); 
							this.solvedTasks++;

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

					}
					else if(this.snappedObject.name == this.spot3_objectName) {

						// ak je umiestneny na spravny spot
						if(this.solvedTasks < this.NumTasksForPlayer  && this.questDone[2] == false && click_x >= this.spot3.x && click_x <= (this.spot3.x + this.spot3.width) && click_y >= this.spot3.y && click_y <= (this.spot3.y + this.spot3.height)) {
							
							game.socket.emit('task done', { sid: game.socket.id, task: this.spot3_objectName }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name); // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name); // vymazat aj z inventara hraca
							this.taskDone(game,this.spot3_objectName); 
							this.solvedTasks++;

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

					}
					else if(this.snappedObject.name == this.spot4_objectName) {

						// ak je umiestneny na spravny spot
						if(this.solvedTasks < this.NumTasksForPlayer  && this.questDone[3] == false && click_x >= this.spot4.x && click_x <= (this.spot4.x + this.spot4.width) && click_y >= this.spot4.y && click_y <= (this.spot4.y + this.spot4.height)) {
							
							game.socket.emit('task done', { sid: game.socket.id, task: this.spot4_objectName }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name); // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name); // vymazat aj z inventara hraca
							this.taskDone(game,this.spot4_objectName); 
							this.solvedTasks++;

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

					}
					else if(this.snappedObject.name == this.spot5_objectName) {

						// ak je umiestneny na spravny spot
						if(this.solvedTasks < this.NumTasksForPlayer  && this.questDone[4] == false && click_x >= this.spot5.x && click_x <= (this.spot5.x + this.spot5.width) && click_y >= this.spot5.y && click_y <= (this.spot5.y + this.spot5.height)) {
							
							game.socket.emit('task done', { sid: game.socket.id, task: this.spot5_objectName }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name); // vymazat aj z inventara hraca
							this.taskDone(game,this.spot5_objectName); 
							this.solvedTasks++;

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

					}
					else if(this.snappedObject.name == this.spot6_objectName) {

						// ak je umiestneny na spravny spot
						if(this.solvedTasks < this.NumTasksForPlayer  && this.questDone[5] == false && click_x >= this.spot6.x && click_x <= (this.spot6.x + this.spot6.width) && click_y >= this.spot6.y && click_y <= (this.spot6.y + this.spot6.height)) {
							
							game.socket.emit('task done', { sid: game.socket.id, task: this.spot6_objectName }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name); // vymazat aj z inventara hraca
							this.taskDone(game,this.spot6_objectName); 
							this.solvedTasks++;

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

					}
					else { // inak ho da na povodne miesto
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


		/*********************** MOUSE MOVE ***************************************/

		this.canvas.element.addEventListener('mousemove', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var cursorPosX = event.clientX - rect.left;
				var cursorPosY = event.clientY - rect.top;

				this.moveSnappedObject(cursorPosX,cursorPosY);

			}

		});

	}

	taskDone(game,task) {
		
		switch(task) {

			case this.spot1_objectName :
				this.questDone[0] = true;
				this.fillSpot(this.spot1_objectName);
				break;
			
			case this.spot2_objectName :
				this.questDone[1] = true;
				this.fillSpot(this.spot2_objectName);
				break;

			case this.spot3_objectName :
				this.questDone[2] = true;
				this.fillSpot(this.spot3_objectName);
				break;
			
			case this.spot4_objectName :
				this.questDone[3] = true;
				this.fillSpot(this.spot4_objectName);
				break;
			
			case this.spot5_objectName :
				this.questDone[4] = true;
				this.fillSpot(this.spot5_objectName);
				break;
			
			case this.spot6_objectName :
				this.questDone[5] = true;
				this.fillSpot(this.spot6_objectName);
				break;
			
			default:
				break;

		}

		this.checkQuests();

	}

	fillSpot(spotFor) {

		switch(spotFor) {

			case this.spot1_objectName :
				this.spot1_fill = new GameObject(this.spot1_objectName+"MG",this.spot1_objectName,this.spot1_objectName,100,100,this.spot1.x,this.spot1.y,this.spot1_img,0,0,0,0,1);
				break;
			
			case this.spot2_objectName :
				this.spot2_fill = new GameObject(this.spot2_objectName+"MG",this.spot2_objectName,this.spot2_objectName,100,100,this.spot2.x,this.spot2.y,this.spot2_img,0,0,0,0,1);
				break;
			
			case this.spot3_objectName :
				this.spot3_fill = new GameObject(this.spot3_objectName+"MG",this.spot3_objectName,this.spot3_objectName,100,100,this.spot3.x,this.spot3.y,this.spot3_img,0,0,0,0,1);
				break;
			
			case this.spot4_objectName :
				this.spot4_fill = new GameObject(this.spot4_objectName+"MG",this.spot4_objectName,this.spot4_objectName,100,100,this.spot4.x,this.spot4.y,this.spot4_img,0,0,0,0,1);
				break;
			
			case this.spot5_objectName :
				this.spot5_fill = new GameObject(this.spot5_objectName+"MG",this.spot5_objectName,this.spot5_objectName,100,100,this.spot5.x,this.spot5.y,this.spot5_img,0,0,0,0,1);
				break;
			
			case this.spot6_objectName :
				this.spot6_fill = new GameObject(this.spot6_objectName+"MG",this.spot6_objectName,this.spot6_objectName,100,100,this.spot6.x,this.spot6.y,this.spot6_img,0,0,0,0,1);
				break;
			
			default:
				break;

		}

	}

	checkQuests() {
		if(this.questDone[0] && this.questDone[1] && this.questDone[2] && this.questDone[3] && this.questDone[4] && this.questDone[5]) {
			this.questComplete = true;
			this.confirm_button.activate();
		}
	}

	render() {
		
		this.preRender();

		// vykreslenie obvodu
		this.canvas.ctx.drawImage(this.circuitImg,this.circuitStartX,this.circuitStartY,this.circuitImg.width,this.circuitImg.height);

		// vykreslenie spotov
		this.spot1.render(this.canvas.ctx);
		this.spot2.render(this.canvas.ctx);
		this.spot3.render(this.canvas.ctx);
		this.spot4.render(this.canvas.ctx);
		this.spot5.render(this.canvas.ctx);
		this.spot6.render(this.canvas.ctx);

		// vykreslenie objektov 
		if(this.spot1_fill != null) this.spot1_fill.renderInventory(this.canvas.ctx);
		if(this.spot2_fill != null) this.spot2_fill.renderInventory(this.canvas.ctx);
		if(this.spot3_fill != null) this.spot3_fill.renderInventory(this.canvas.ctx);
		if(this.spot4_fill != null) this.spot4_fill.renderInventory(this.canvas.ctx);
		if(this.spot5_fill != null) this.spot5_fill.renderInventory(this.canvas.ctx);
		if(this.spot6_fill != null) this.spot6_fill.renderInventory(this.canvas.ctx);

		// vykreslenie objektov inventara
		this.objects.forEach((object) => {
			object.renderInventory(this.canvas.ctx);
			this.canvas.ctx.font = "bold 11px 'Ubuntu', sans-serif";
			this.canvas.ctx.fillStyle = "#000000";
			this.canvas.ctx.fillText(object.description,object.x,object.y+60);
		});

		this.canvas.ctx.font = "bold 15px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";
		this.canvas.ctx.fillText(this.description,10,30);

		if(!this.questComplete && this.solvedTasks >= this.NumTasksForPlayer) {
			this.canvas.ctx.font = "bold 18px 'Ubuntu', sans-serif";
			this.canvas.ctx.fillStyle = "#f21010";
			this.canvas.ctx.fillText("Zapojil si polovicu komponentov, ostatné nechaj na tvojho spoluhráča.",15,445);
		} 

	}

}