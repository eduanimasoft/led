/* **************************************************************************************** */
/* ********************************* Class Barrier **************************************** */
/* **************************************************************************************** */

class Barrier extends Sprite {

	constructor(x,y,w,h,img) {
		super(w,h,x,y,img,0,0,0,0,1);
		this.removeMAX = -80;
		this.removed = false;
	}

	remove() {
		this.y = -80;
		this.removed = true;
	}

	move() {

		if(this.y > this.removeMAX) 
			this.y -= 2;
		else 
			this.removed = true;

	}

	render(ctx) {
		ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
	}

}


/* **************************************************************************************** */
/* ********************************* Class DoorRepairQuest ******************************** */
/* **************************************************************************************** */

class DoorRepairQuest extends MiniGame {

	constructor(game,name,MGobj) {

		let tasksForPlayer = 1;
		let info1_Img = game.findImage("doorRepairQuest_Info1");
		let info2_Img = game.findImage("doorRepairQuest_Info2");
		super(name,MGobj,game.canvas,tasksForPlayer,[info1_Img,info2_Img]);
		
		this.bgImg = game.findImage("minigame_bg");
		this.description = "Musíte opraviť obvody a spoločne odtlačiť barieru.";
		this.objects = [];
		this.questDone = [false, false, false];

		let spotImg = game.findImage("spotImg");
		this.resistor_spot = new Spot(spotImg,"resistor",145,59,50,50);
		this.wire_spot = new Spot(spotImg,"wire",610,59,50,50);

		this.snappedObject = null;
		this.resistor = null;
		this.wire = null;

		let barrierImg = game.findImage("barrier");
		this.barrier = new Barrier(363,120,60,220,barrierImg);

		this.removing = false; // ci prave odstranuje barieru hrac
		this.teammateRemoving = false; // ci prave odstranuje barieru spoluhrac

		this.drawCompliment = [false, false]; // [LED, foto]
		this.missionComplete = false;
		this.missionText = "";

		this.receiveMessage(game);
		this.control(game);

	}

	go(game) {
		this.load(game);
		this.controlBlock = false;
		game.world.player.controlBlock = true;
		window.cancelAnimationFrame(game.request);
		this.gameLoop(game);
	}

	load(game) {

		// zisti ci maju so sebou nerast
		let mineral = game.world.player.inventory.items.filter((item) => { return item.name == "arcikan"; });
		
		if(mineral.length > 0) {
			this.missionComplete = true;
			game.socket.emit('mineral');
		}
		else {
			this.missionComplete = false;
		}

		this.legendaImg = game.findImage("legenda");
		this.LEDcircuitON_img = game.findImage("LEDcircuitON");
		this.LEDcircuitOFF_img = game.findImage("LEDcircuitOFF");
		this.PHOTOcircuitON_img = game.findImage("PHOTOcircuitON");
		this.PHOTOcircuitOFF_img = game.findImage("PHOTOcircuitOFF");
		this.LEDlight_img = game.findImage("LEDlight");
		this.LEDlightB_img = game.findImage("LEDlightB");

		this.objects = [];
		
		for(let i = 0; i < game.world.player.inventory.items.length; i++) {
			this.objects[i] = game.world.player.inventory.items[i];
			this.objects[i].setPosition(350+(i*(this.objects[i].width+10)),420);
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

				// ak drzi mys(mouse down) na bariere
				if(click_x >= this.barrier.x && click_x <= (this.barrier.x + this.barrier.width) && click_y >= this.barrier.y && click_y <= (this.barrier.y + this.barrier.height)) {
					
					// odosle spravu na server ze hrac odstranuje prekazku
					game.socket.emit('removing barrier', game.socket.id);
					this.removing = true; // zapise ze odstranuje prekazku

					if(this.teammateRemoving) { // ak spoluhrac odstranuje prekazku
						game.socket.emit('barrier moved', game.socket.id); // odosiela na server ze sa prekazka posunula
					}

				}

			}

		});


		/*********************** MOUSE UP *****************************************/

		this.canvas.element.addEventListener('mouseup', (event) => {

			if(!this.controlBlock) {

				game.socket.emit('not removing barrier', game.socket.id);
				this.removing = false;

				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				// ak bol nejaky objekt chyteny a pustil mys tak sa zisti ci na spravny spot ak ano zostane tam inak sa vrati s5
				if(this.snappedObject != null) {

					// ak je chyteny predmet rezistor
					if(this.snappedObject.type == "resistor") {

						// ak je umiestneny na spravny spot
						if(this.solvedTasks < this.NumTasksForPlayer  && this.questDone[0] == false && click_x >= this.resistor_spot.x && click_x <= (this.resistor_spot.x + this.resistor_spot.width) && click_y >= this.resistor_spot.y && click_y <= (this.resistor_spot.y + this.resistor_spot.height)) {
							
							game.socket.emit('task done', { sid: game.socket.id, task: "resistor" }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name) // vymazat aj z inventara hraca
							this.taskDone(game,"resistor"); // splnena 1. uloha
							this.solvedTasks++;

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

					}
					// ak je chyteny predmet drot
					else if(this.snappedObject.type == "wire") {

						// ak je umiestneny na spravny spot
						if(this.solvedTasks < this.NumTasksForPlayer  && this.questDone[1] == false && click_x >= this.wire_spot.x && click_x <= (this.wire_spot.x + this.wire_spot.width) && click_y >= this.wire_spot.y && click_y <= (this.wire_spot.y + this.wire_spot.height)) {
							
							game.socket.emit('task done', { sid: game.socket.id, task: "wire" }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name) // vymazat aj z inventara hraca
							this.taskDone(game,"wire"); // splnena 2. uloha
							this.solvedTasks++;

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

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

	receiveMessage(game) {
		game.socket.on('mineral', () => {
			this.missionComplete = true;
		});
	}

	taskDone(game,task) {
		
		if(task == "resistor"){
			this.questDone[0] = true;
			this.fillSpot(game,"resistor");
			this.drawCompliment[0] = true;
		}
		else if(task == "wire"){
			this.questDone[1] = true;
			this.fillSpot(game,"wire");
			this.drawCompliment[1] = true;
		}

	}

	fillSpot(game,spotFor) {

		if(spotFor == "resistor"){
			let resistorImg = game.findImage("resistor");
			this.resistor = new GameObject("resistorMG","resistor","odpor",50,50,this.resistor_spot.x,this.resistor_spot.y,resistorImg,0,0,0,0,1); // drot
		}
		else if(spotFor == "wire"){
			let wireImg = game.findImage("wire");
			this.wire = new GameObject("wireMG","wire","vodič",50,50,this.wire_spot.x,this.wire_spot.y,wireImg,0,0,0,0,1); // odpor
		}

	}

	gameLoop(game) {
		this.checkRemoving(game);
		this.checkQuests();
		this.render();
		this.request = window.requestAnimationFrame( () => {
			this.gameLoop(game);
		});
	}

	win(game) {
		game.socket.emit('happy end');
		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.story.happyEnd(game);
	}

	checkRemoving(game) {
		if(this.removing && this.teammateRemoving) this.barrier.move();
		if(this.barrier.removed) game.socket.emit('barrier removed');
	}

	checkQuests() {
		
		if(this.barrier.removed) this.questDone[2] = true;
		
		if(!this.missionComplete) 
			this.missionText = "Aby ste mohli odletieť, musíte splniť misiu, vyťažiť nerast, a zobrať ho so sebou.";
		else 
			this.missionText = "";

		if(this.missionComplete && this.questDone[0] && this.questDone[1] && this.questDone[2]) 
			this.confirm_button.activate();
		else
			this.confirm_button.deactivate();
	}

	render() {
		
		this.preRender();
		
		/*********************** vykreslenie - vizualizacia ulohy ****************************************/

		// k zapojeniu odporu
		if(this.questDone[0]) {

			// odstranenie bariery
			if(this.questDone[2]) 
				this.canvas.ctx.drawImage(this.LEDlight_img,205,65,365,287); // svetlo LED
			else
				this.canvas.ctx.drawImage(this.LEDlightB_img,210,80,154,251); // svetlo LED po barier
		
			this.canvas.ctx.drawImage(this.LEDcircuitON_img,35,80,306,222); // obvod s LED - ON

		}
		else {
			this.canvas.ctx.drawImage(this.LEDcircuitOFF_img,35,80,306,222); // obvod s LED - OFF
		}

		// k zapojeniu drotu
		if(this.questDone[1]) 
			this.canvas.ctx.drawImage(this.PHOTOcircuitON_img,500,80,285,233); // obvod s fotodiodou  - ON
		else 
			this.canvas.ctx.drawImage(this.PHOTOcircuitOFF_img,500,80,285,233); // obvod s fotodiodou - OFF

		/*************************************************************************************************/

		// vykreslenie legendy
		this.canvas.ctx.drawImage(this.legendaImg,10,395,320,100);

		// vykreslenie spotov
		this.resistor_spot.render(this.canvas.ctx);
		this.wire_spot.render(this.canvas.ctx);

		// vykreslenie objektov 
		if(this.resistor != null) this.resistor.renderInventory(this.canvas.ctx);
		if(this.wire != null) this.wire.renderInventory(this.canvas.ctx);

		// vykreslenie bariery
		this.barrier.render(this.canvas.ctx);

		// vykreslenie objektov inventara
		this.objects.forEach((object) => {
			object.renderInventory(this.canvas.ctx);
			this.canvas.ctx.font = "bold 11px 'Ubuntu', sans-serif";
			this.canvas.ctx.fillStyle = "#000000";
			this.canvas.ctx.fillText(object.description,object.x,object.y+60);
		});

		// texty
		// popis ulohy
		this.canvas.ctx.font = "bold 18px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";
		this.canvas.ctx.fillText(this.description,180,23);

		// ci maju nerast
		this.canvas.ctx.font = "bold 15px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#f21010";
		this.canvas.ctx.fillText(this.missionText,135,385);

		// oznam ze uz nemoze robit dalsie ulohy, musi spoluhrac
		if(this.solvedTasks >= this.NumTasksForPlayer) {
			this.canvas.ctx.font = "bold 15px 'Ubuntu', sans-serif";
			this.canvas.ctx.fillStyle = "#f21010";
			this.canvas.ctx.fillText("Opravil si jeden obvod, druhý nechaj na tvojho spoluhráča.",155,365);
		}

		// pochvaly
		this.canvas.ctx.font = "15px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";

		if(this.drawCompliment[0]) {
			this.canvas.ctx.fillText("Výborne! Opravili ste obvod s LED diódou.",220,50);
		}
		if(this.drawCompliment[1]) {
			this.canvas.ctx.fillText("Super! Opravili ste obvod s fotodiódou.",220,70);
		}

	}

}