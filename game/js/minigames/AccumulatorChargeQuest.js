/* **************************************************************************************** */
/* ************************************ Class Timer *************************************** */
/* **************************************************************************************** */

class Timer extends Sprite {

	constructor(x,y,w,h,img,value,max,incImg,decImg) {
		super(w,h,x,y,img,0,0,0,0,1);
		this.value = value;
		this.maxValue = max;
		this.inc_button = new Button("inc_button",null,true,this.x+this.width,this.y,12,12,incImg,null);
		this.dec_button = new Button("dec_button",null,true,this.x+this.width,this.y+13,12,12,decImg,null);
	}

	setValue(newValue) {
		this.value = newValue;
	}

	click_increase(click_x,click_y,n) {
		
		if(this.inc_button.click(click_x,click_y)) {
			if(this.value+n <= this.maxValue) this.value += n;
			return true;
		}

		return false;

	}

	click_decrease(click_x,click_y,n) {
		
		if(this.dec_button.click(click_x,click_y)) {
			if(this.value >= n) this.value -= n;
			return true;
		}

		return false;

	}

	render(ctx) {

		if(this.visible == 1) {

			ctx.drawImage(this.img,this.x,this.y,this.width,this.height);

			ctx.font = "bold 18px 'Ubuntu', sans-serif";
			ctx.fillStyle = "#000000";
			ctx.fillText(this.value+" h",this.x+15,this.y+17);

			this.inc_button.render(ctx);
			this.dec_button.render(ctx);

		}

	}

}


/* **************************************************************************************** */
/* ***************************** Class AccumulatorChargeQuest ***************************** */
/* **************************************************************************************** */

class AccumulatorChargeQuest extends MiniGame {

	constructor(game,name,MGobj) {

		let tasksForPlayer = 3;
		let infoImg = game.findImage("AccumulatorChargeQuest_Info");
		super(name,MGobj,game.canvas,tasksForPlayer,[infoImg]);

		this.bgImg = game.findImage("AccChargeQuest_bg");
		this.description1 = "1. Vlož akumulátory do nabíjačky.";
		this.description2 =  "2. Nastav čas, aký sa má akumulátor nabíjať podľa jeho kapacity.";

		this.objects = [];

		let spotImg = game.findImage("spotImg");
		this.spots = [
					   new Spot(spotImg,"discharged_accumulator",50,150,80,80), 
					   new Spot(spotImg,"discharged_accumulator",50,250,80,80)
					 ];

		this.spots_fill = [null,null];

		this.snappedObject = null;

		this.acc_capacities = [1100,1257,1143]; // v mAh
		this.charge_currents = [110,220,1600]; //v mA

		let timerImg = game.findImage("timer");
		let incImg = game.findImage("increase_button");
		let decImg = game.findImage("decrease_button");

		this.timers = [
						new Timer(380,90,60,25,timerImg,0,150,incImg,decImg),
						new Timer(380,200,60,25,timerImg,0,150,incImg,decImg),
						new Timer(380,310,60,25,timerImg,0,150,incImg,decImg)
					  ];

		this.accumulator_img = game.findImage("accumulator");
		this.charger_img = game.findImage("charger_quest");

		this.control(game);

	}

	load(game) {

		this.spots_fill = [null, null];

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

					if(this.snappedObject.type == "discharged_accumulator") {

						if(this.spots_fill[0] == null && click_x >= this.spots[0].x && click_x <= (this.spots[0].x + this.spots[0].width) && click_y >= this.spots[0].y && click_y <= (this.spots[0].y + this.spots[0].height)) {
							
							game.socket.emit('fill spot', { spot: 0, objName: this.snappedObject.name }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
							this.fillSpot(0,this.snappedObject.img);

						}
						else if(this.spots_fill[1] == null && click_x >= this.spots[1].x && click_x <= (this.spots[1].x + this.spots[1].width) && click_y >= this.spots[1].y && click_y <= (this.spots[1].y + this.spots[1].height)) {
							
							game.socket.emit('fill spot', { spot: 1, objName: this.snappedObject.name }); // odoslanie spravy na server
							this.deleteObject(this.snappedObject.name) ; // vymazat snapped object z objects 
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

				// click na timer
				this.timers.forEach((timer,i) => {
					let inc = timer.click_increase(click_x,click_y,1);
					let dec = timer.click_decrease(click_x,click_y,1);
					if(inc || dec) game.socket.emit('timer changed', { timer: i, newVal: timer.value });
				});

			}

		});

	}

	fillSpot(spot,fill_img) {
		if(this.spots_fill[spot] == null) this.spots_fill[spot] = new GameObject("accumulator"+spot+"_MG","accumulator"+spot+"_MG","accumulator"+spot+"_MG",100,100,this.spots[spot].x,this.spots[spot].y,fill_img,0,0,0,0,1);
	}

	checkDone() {

		if(this.spots_fill[0] != null && this.spots_fill[1] != null) {
			if(this.timers[0].value == this.calculate_time(this.acc_capacities[0],this.charge_currents[0]) && this.timers[1].value == this.calculate_time(this.acc_capacities[1],this.charge_currents[1]) && this.timers[2].value == this.calculate_time(this.acc_capacities[2],this.charge_currents[2])) 
				this.confirm_button.activate();
			else
				this.confirm_button.deactivate();
		}
		else {
			this.message = "Vlož akumulátory do nabíjačky.";
			this.confirm_button.deactivate();
		}

	}

	calculate_time(Q,I) {
		return Math.round((Q * 1.4)/I);
	}

	win(game) {
		
		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.world.player.controlBlock = false; // odblokuje ovladanie hry
		game.gameLoop();
		
		// zmeni typ accumulatora (je nabity)
		game.world.player.inventory.items.forEach((item) => {
			if(item.type == "discharged_accumulator") {
				item.type = "accumulator";
				item.description = "nabitý akumulátor";
			}
		});

		let trigger = game.world.stage.getObjectByName("charger_trigger");
		game.world.stage.deleteObject(trigger);

		game.world.stage.mission = "Vráťte nabité akumulátory do vozidla.";

	}

	render() {
		
		this.preRender();

		// vykreslenie akumulatorov
		game.canvas.ctx.font = "bold 15px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";
		
		this.canvas.ctx.drawImage(this.accumulator_img,250,80,80,80);
		this.canvas.ctx.fillText(this.acc_capacities[0]+"mAh",260,177);

		this.canvas.ctx.drawImage(this.accumulator_img,250,190,80,80);
		this.canvas.ctx.fillText(this.acc_capacities[1]+"mAh",260,287);

		this.canvas.ctx.drawImage(this.accumulator_img,250,300,80,80);
		this.canvas.ctx.fillText(this.acc_capacities[2]+"mAh",260,397);

		// vykreslenie timerov
		this.timers.forEach((timer) => {
			timer.render(this.canvas.ctx);
		});

		//vykreslenie nabijciek
		this.canvas.ctx.drawImage(this.charger_img,525,80,120,80);
		this.canvas.ctx.fillText(this.charge_currents[0]+"mA",565,177);

		this.canvas.ctx.drawImage(this.charger_img,525,190,120,80);
		this.canvas.ctx.fillText(this.charge_currents[1]+"mA",565,287);

		this.canvas.ctx.drawImage(this.charger_img,525,300,120,80);
		this.canvas.ctx.fillText(this.charge_currents[2]+"mA",565,397);

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
		});

		game.canvas.ctx.font = "bold 18px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";
		this.canvas.ctx.fillText(this.description1,40,30);
		this.canvas.ctx.fillText(this.description2,40,55);

	}

}