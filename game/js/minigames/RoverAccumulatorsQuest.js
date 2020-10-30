/* **************************************************************************************** */
/* ***************************** Class RoverAccumulatorsQuest ***************************** */
/* **************************************************************************************** */

class RoverAccumulatorsQuest extends MiniGame {

	constructor(game,name,MGobj) {
	
		let tasksForPlayer = 1;
		super(name,MGobj,game.canvas,tasksForPlayer,null);
	
		this.bgImg = game.findImage("minigame_bg");
		this.description = "Zapojte nabité akumulátory.";

		this.objects = [];
		this.snappedObject = null;

		this.info_button = null;

		let spotImg = game.findImage("spotImg");
		this.spots = [
					   new Spot(spotImg,"accumulator",250,200,100,100), 
					   new Spot(spotImg,"accumulator",450,200,100,100)
					 ];

		this.spots_fill = [null,null];

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

				// ak bol nejaky objekt chyteny a klikol tak sa zisti ci na spravny spot ak ano zostane tam inak sa vrati s5
				if(this.snappedObject != null) {

					if(this.snappedObject.type == "accumulator") {

						if(this.spots_fill[0] == null && click_x >= this.spots[0].x && click_x <= (this.spots[0].x + this.spots[0].width) && click_y >= this.spots[0].y && click_y <= (this.spots[0].y + this.spots[0].height)) {
							
							game.socket.emit('fill spot', { spot: 0, objName: this.snappedObject.name }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name); // vymazat aj z inventara
							this.fillSpot(0,this.snappedObject.img);

						}
						else if(this.spots_fill[1] == null && click_x >= this.spots[1].x && click_x <= (this.spots[1].x + this.spots[1].width) && click_y >= this.spots[1].y && click_y <= (this.spots[1].y + this.spots[1].height)) {
							
							game.socket.emit('fill spot', { spot: 1, objName: this.snappedObject.name }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							game.world.player.inventory.remove(this.snappedObject.name); // vymazat aj z inventara
							this.fillSpot(1,this.snappedObject.img);

						}
						else { // inak ho da na povodne miesto
							this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
						}

					}
					else { // inak ho da na povodne miesto
						this.snappedObject.setPosition(this.objPrevX,this.objPrevY);
					}

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

	fillSpot(spot,fill_img) {
		if(this.spots_fill[spot] == null) this.spots_fill[spot] = new GameObject("accumulator"+spot+"_MG","accumulator"+spot+"_MG","accumulator"+spot+"_MG",100,100,this.spots[spot].x,this.spots[spot].y,fill_img,0,0,0,0,1);
	}

	checkDone() {

		if(this.spots_fill[0] != null && this.spots_fill[1] != null) 
			this.confirm_button.activate();
		else
			this.confirm_button.deactivate();

	}

	win(game) {

		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.world.player.controlBlock = false; // odblokuje ovladanie hry
		game.gameLoop();

		let trigger = game.world.stage.getObjectByName("rover_trigger");
		game.world.stage.deleteObject(trigger);

		// vytvori trigger na jazdenie na aute
		game.world.stage.objects.push( new GameObject("rover_drive_trigger","rover_drive_trigger","rover_drive_trigger",230,135,1000,325,null,0,0,1,0,0) );

		// zmeni aktualnu misiu
		game.world.stage.mission = "Cieľom vašej misie je vyťažiť novoobjavený nerast, použite vozidlo.";

	}

	render() {

		this.preRender();

		// vykreslenie spotov
		this.spots.forEach((spot) => {
			spot.render(this.canvas.ctx);
		});

		// vykreslenie vyplni spotov
		this.spots_fill.forEach((spot_fill) => {
			if(spot_fill != null) spot_fill.renderInventory(this.canvas.ctx);
		});

		// vykreslenie objektov inventara
		this.objects.forEach((object) => {
			object.renderInventory(this.canvas.ctx);
			this.canvas.ctx.font = "bold 11px 'Ubuntu', sans-serif";
			this.canvas.ctx.fillStyle = "#000000";
			this.canvas.ctx.fillText(object.description,object.x,object.y+60);
		});

		game.canvas.ctx.font = "bold 20px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";
		this.canvas.ctx.fillText(this.description,200,30);

	}

}