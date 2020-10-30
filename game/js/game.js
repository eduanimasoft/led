
/* **************************************************************************************** */
/* ************************************** Class Game ************************************** */
/* **************************************************************************************** */

class Game {

	constructor(socket) {

		this.socket = socket;
		this.menu = new Menu(this);
		this.canvas = new Canvas("canvas");
		this.infobox = 0;
		this.world = 0;
		this.story = new Story();
		this.images = [];
		this.request = undefined;
		this.fps = 0;
		this.lastCalledTime = null;

		this.firstFrame = true;
		this.lastFrameTimeMs = null;
		this.timestep = 1000/60;
 
	}

	loadImages() {

		// inicializacia a vytvorenie vsetkych obrazkov v hre
		let images = [	
						['waiting_bg', './data/img/waiting_bg.png'],
						['inventory_bg', './data/img/inventory_bg.png'],
						['infobox', './data/img/infobox.png'],
						['button', './data/img/button.png'],
						['dialogbox', './data/img/dialogbox.png'],
						['photon', './data/img/foton.png'],
						['electron', './data/img/elektron.png'],
						['zem', './data/img/stages/zem.png'],
						['stage0_bg', './data/img/stages/stage0_bg.png'],
						['solar_panels', './data/img/stages/solar_panels.png'],
						['flag', './data/img/stages/flag.png'],
						['module_od_bp', './data/img/stages/module1.png'],
						['module_od', './data/img/stages/module2.png'],
						['module', './data/img/stages/module3.png'],
						['module_wl', './data/img/stages/module4.png'],
						['mining_machine', './data/img/stages/mining_machine.png'],
						['station', './data/img/stages/station.png'],
						['station_in', './data/img/stages/station_in.png'],
						['openedDoor', './data/img/stages/openedDoor.png'],
						['closedDoor', './data/img/stages/closedDoor.png'],
						['downstairsDoor', './data/img/stages/downstairsDoor.png'],
						['upstairsDoor', './data/img/stages/upstairsDoor.png'],
						['rover', './data/img/stages/rover.png'],
						['wire', './data/img/stages/wire.png'],
						['resistor', './data/img/stages/resistor.png'],
						['doorRepairQuest_Info1', './data/img/stages/doorRepairQuest/doorRepairQuest_info1.png'],
						['doorRepairQuest_Info2', './data/img/stages/doorRepairQuest/doorRepairQuest_info2.png'],
						['LEDcircuitON', './data/img/stages/doorRepairQuest/LEDcircuit_1.png'],
						['LEDcircuitOFF', './data/img/stages/doorRepairQuest/LEDcircuit_0.png'],
						['PHOTOcircuitON', './data/img/stages/doorRepairQuest/PHOTOcircuit_1.png'],
						['PHOTOcircuitOFF', './data/img/stages/doorRepairQuest/PHOTOcircuit_0.png'],
						['LEDlight', './data/img/stages/doorRepairQuest/LEDlight.png'],
						['LEDlightB', './data/img/stages/doorRepairQuest/LEDlightB.png'],
						['barrier', './data/img/stages/doorRepairQuest/barrier.png'],
						['active_confirm_button', './data/img/active_confirm_button.png'],
						['inactive_confirm_button', './data/img/inactive_confirm_button.png'],
						['exit_button', './data/img/exit_button.png'],
						['next_button', './data/img/next_button.png'],
						['previous_button', './data/img/previous_button.png'],
						['info_button', './data/img/info_button.png'],
						['goBack_button', './data/img/goBack_button.png'],
						['legenda', './data/img/stages/doorRepairQuest/legenda.png'],
						['spotImg', './data/img/stages/spot.png'],
						['SolarPanelsRepairQuest_bg', './data/img/stages/solarPanelsRepairQuest/solarPanelsRepairQuest_bg.png'],
						['SolarPanelsRepairQuest_Info', './data/img/stages/solarPanelsRepairQuest/solarPanelsRepairQuest_info.png'],
						['solarPanel_circuit', './data/img/stages/solarPanelsRepairQuest/circuit.png'],
						['accumulator', './data/img/stages/solarPanelsRepairQuest/accumulator.png'],
						['solarPanel', './data/img/stages/solarPanelsRepairQuest/solarPanel.png'],
						['converter', './data/img/stages/solarPanelsRepairQuest/converter.png'],
						['regulator', './data/img/stages/solarPanelsRepairQuest/regulator.png'],
						['ACdevice', './data/img/stages/solarPanelsRepairQuest/ACdevice.png'],
						['pexeso_info', './data/img/stages/pexeso/pexeso_info.png'],
						['card_rub', './data/img/stages/pexeso/card_rub.png'],
						['card_border_red', './data/img/stages/pexeso/card_border_red.png'],
						['card_border_blue', './data/img/stages/pexeso/card_border_blue.png'],
						['blue_diode', './data/img/stages/pexeso/blue_diode.png'],
						['blue_diode_pair', './data/img/stages/pexeso/blue_diode_pair.png'],
						['yellow_diode', './data/img/stages/pexeso/yellow_diode.png'],
						['yellow_diode_pair', './data/img/stages/pexeso/yellow_diode_pair.png'],
						['orange_diode', './data/img/stages/pexeso/orange_diode.png'],
						['orange_diode_pair', './data/img/stages/pexeso/orange_diode_pair.png'],
						['red_diode', './data/img/stages/pexeso/red_diode.png'],
						['red_diode_pair', './data/img/stages/pexeso/red_diode_pair.png'],
						['green_diode', './data/img/stages/pexeso/green_diode.png'],
						['green_diode_pair', './data/img/stages/pexeso/green_diode_pair.png'],
						['white_diode', './data/img/stages/pexeso/white_diode.png'],
						['white_diode_pair', './data/img/stages/pexeso/white_diode_pair.png'],
						['rgb_diode', './data/img/stages/pexeso/rgb_diode.png'],
						['rgb_diode_pair', './data/img/stages/pexeso/rgb_diode_pair.png'],
						['infrared_diode', './data/img/stages/pexeso/infrared_diode.png'],
						['infrared_diode_pair', './data/img/stages/pexeso/infrared_diode_pair.png'],
						['RgbLedQuest_Info1', './data/img/stages/RGBLEDQuest/RgbLedQuest_Info1.png'],
						['RgbLedQuest_Info2', './data/img/stages/RGBLEDQuest/RgbLedQuest_Info2.png'],
						['RGBLED_circuit', './data/img/stages/RGBLEDQuest/RGBLED_circuit.png'],
						['switch', './data/img/stages/RGBLEDQuest/switch.png'],
						['RGBLED', './data/img/stages/RGBLEDQuest/RGBLED.png'],
						['RGBLED_obrys', './data/img/stages/RGBLEDQuest/RGB_obrys.png'],
						['LaserComRepairQuest_Info', './data/img/stages/LaserComRepairQuest/LaserComRepairQuest_Info.png'],
						['laserCom_circuit', './data/img/stages/LaserComRepairQuest/laserCom_circuit.png'],
						['laser_item', './data/img/stages/LaserComRepairQuest/laser_item.png'],
						['solarCell', './data/img/stages/LaserComRepairQuest/solarCell.png'],
						['audioAmp', './data/img/stages/LaserComRepairQuest/audioAmp.png'],
						['audioTransf', './data/img/stages/LaserComRepairQuest/audioTransf.png'],
						['LaserTypesQuest_bg', './data/img/stages/LaserTypesQuest/LaserTypesQuest_bg.png'],
						['LaserTypesQuest_Info', './data/img/stages/LaserTypesQuest/LaserTypesQuest_info.png'],
						['basket', './data/img/stages/LaserTypesQuest/basket.png'],
						['item', './data/img/stages/LaserTypesQuest/item.png'],
						['laserH', './data/img/stages/laserH.png'],
						['laserV', './data/img/stages/laserV.png'],
						['laseroff', './data/img/stages/laseroff.png'],
						['charger', './data/img/stages/charger.png'],
						['AccChargeQuest_bg', './data/img/stages/AccumulatorChargeQuest/AccChargeQuest_bg.png'],
						['AccumulatorChargeQuest_Info', './data/img/stages/AccumulatorChargeQuest/AccChargeQuest_info.png'],
						['charger_quest', './data/img/stages/AccumulatorChargeQuest/charger_quest.png'],
						['timer', './data/img/stages/AccumulatorChargeQuest/timer.png'],
						['increase_button', './data/img/stages/AccumulatorChargeQuest/increase_button.png'],
						['decrease_button', './data/img/stages/AccumulatorChargeQuest/decrease_button.png'],
						['arcikan', './data/img/stages/arcikan.png'],
						['flame', './data/img/story/plamen.png'],
						['meteor', './data/img/story/meteorit.png'],
						['module_indoor', './data/img/story/passage_stage1/modul_in.png'],
						['module_panels', './data/img/story/passage_stage1/modul_panels.png'],
						['module_chairs', './data/img/story/passage_stage1/chairs.png'],
						['minigame_bg', './data/img/stages/minigame_bg.png'],
						['rover_wp', './data/img/story/drivingScene/rover_wp.png'],
						['rover_wheel', './data/img/story/drivingScene/rover_wheel.png'],
						['communication', './data/img/story/communication.png'],
						['closedDoor_led', './data/img/stages/closedDoor_led.png'],
						['openedDoor_led', './data/img/stages/openedDoor_led.png'],
						['ChooseCorrectQuest_Info', './data/img/stages/ChooseCorrectQuest/ChooseCorrectQuest_info.png'],
						['zone', './data/img/stages/ChooseCorrectQuest/zone.png'],
						['modry_laser_LA', './data/img/stages/ChooseCorrectQuest/modry_laser.png'],
						['semafor_LA', './data/img/stages/ChooseCorrectQuest/semafor.png'],
						['solarny_clanok_LA', './data/img/stages/ChooseCorrectQuest/solarny_clanok.png'],
						['obrazovka_LA', './data/img/stages/ChooseCorrectQuest/podsvietenie_obrazovky.png'],
						['TVovladac_LA', './data/img/stages/ChooseCorrectQuest/ovladacTV.png'],
						['LEDbaterka_LA', './data/img/stages/ChooseCorrectQuest/baterkaLED.png']
					];

		for(let i = 0; i < images.length ; i++) {

			let imgName = images[i][0];
			let img = new Image();
			img.src = images[i][1];
			var imgArray = [imgName, img];
			this.images.push(imgArray);

		}

	}


	load(roomid,charType) {

		// najde obrazok hraca podla typu jeho postavy v images
		let playerImage = this.findImage(charType);
		let teammateCharType = 0;
		let teammateImage = 0;

		// zistenie typu charcteru a obrazku spoluhraca
		if (charType == "electron") {
			teammateCharType = "photon";
			teammateImage = this.findImage("photon");
		}
		else{
			teammateCharType = "electron";
			teammateImage = this.findImage("electron");
		}

		// vytvorenie objektov
		let player = new Player(this,40,100,400,300,charType,playerImage,roomid); 
		let teammate = new Teammate(40,100,400,300,teammateCharType,teammateImage); 
		this.world = new World(this,player,teammate);
		let infoBoxImg = this.findImage("infobox");
		this.infobox = new InfoBox(700,40,50,10,infoBoxImg);
		let dialogBoxImg = this.findImage("dialogbox");
		this.dialogbox = new DialogBox(this,"Naozaj chceš ukončiť hru?",200,180,400,140,dialogBoxImg);

	}

	findImage(name) {

		// vrati obrazok (typ Image) podla nazvu z pola images
		for(let i = 0; i < this.images.length; i++) {
			
			if(this.images[i][0] == name){
				return this.images[i][1];
			}

		}

	}

	receiveMessages() {

		// 'position' -> nastavi poziciu spoluhraca
		this.socket.on('position', (data) => {
			this.world.teammate.updatePosition(data);
		});

		// 'teammate disconnected' -> ukonci hru a vypise dovod
		this.socket.on('teammate disconnected', () => {
			this.end("teammate disconnected");
		});

		// 'create gameObject' -> vytvori GameObject v danom levely
		this.socket.on('create gameObject', (data) => {
			let img = new Image();
			img.src = data.imgSrc;
			this.world.stage.createGameObject(data.name, data.type, data.desc, data.w, data.h, data.x, data.y, img);
		});

		// 'delete object' -> odstrani object v danom levely
		this.socket.on('delete object', (object) => {
			this.world.stage.deleteObject(object);
		});

		// 'start quest' -> spusti hru
		this.socket.on('start quest', () => {
			this.world.stage.quest.go(this);
		});

		// 'task done' -> zavola metódu taskDone danej minihry
		this.socket.on('task done', (task) => {
			this.world.stage.quest.taskDone(this,task);
		});

		// 'removing barrier' -> nastavy premennu teammmateRemoving na true
		this.socket.on('removing barrier', () => {
			this.world.stage.quest.teammateRemoving = true;
		});

		this.socket.on('not removing barrier', () => {
			this.world.stage.quest.teammateRemoving = false;
		});

		this.socket.on('barrier moved', () => {
			this.world.stage.quest.barrier.move();
		});

		this.socket.on('barrier removed', () => {
			this.world.stage.quest.barrier.remove();
		});

		this.socket.on('show card', (card) => {
			this.world.stage.quest.getCard(card).show();
			this.world.stage.quest.getCard(card).turnedBy = this.world.teammate.type;
		});

		this.socket.on('hide cards', (cards) => {
			this.world.stage.quest.getCard(cards.card1).hide();
			this.world.stage.quest.getCard(cards.card2).hide();
		});

		this.socket.on('pair found', () => {
			this.world.stage.quest.pairFound(this);
		});

		this.socket.on('potentiometer switched', (data) => {
			
			let n;
			let switch_obj = null;

			if (data.position == 0) n = 255;
			else if (data.position == 1) n = 127;
			else if (data.position == 2) n = 0;

			if(data.switch_name == "redLED_switch") {
				this.world.stage.quest.rgb_colors[0] = n;
				switch_obj = this.world.stage.quest.redLED_switch;
			}
			else if(data.switch_name == "greenLED_switch") {
				this.world.stage.quest.rgb_colors[1] = n;
				switch_obj = this.world.stage.quest.greenLED_switch;
			}
			else if(data.switch_name == "blueLED_switch") {
				this.world.stage.quest.rgb_colors[2] = n;
				switch_obj = this.world.stage.quest.blueLED_switch;
			}

			switch_obj.changePosition(data.position);

		});

		this.socket.on('pin item', (data) => {

			let pinnedItem = this.world.stage.quest.items.find((item) => { return item.name == data.itemName; });
			if(this.world.stage.quest.baskets[data.basketIndex].isEmpty()) 
				this.world.stage.quest.baskets[data.basketIndex].type = pinnedItem.laserType;
			this.world.stage.quest.baskets[data.basketIndex].addItem(pinnedItem);
			this.world.stage.quest.items = this.world.stage.quest.items.filter((item) => { return item.name != data.itemName; });
			this.world.stage.quest.baskets[data.basketIndex].nextItemTypeSet();

			if(this.world.stage.quest.snappedItem != null && this.world.stage.quest.snappedItem.name == data.itemName) 
				this.world.stage.quest.snappedItem = null;

		});

		this.socket.on('fill spot', (data) => {
			let img = this.findImage("accumulator");
			this.world.stage.quest.fillSpot(data.spot,img);
		});

		this.socket.on('timer changed', (data) => {
			this.world.stage.quest.timers[data.timer].setValue(data.newVal);
		});

		this.socket.on('mine', () => {
			
			let arcikans = this.world.stage.objects.filter((obj) => { return obj.name == "arcikan"; });
			
			if(arcikans.length <= 0) {
				let arcikanImg = this.findImage("arcikan");
				this.world.stage.objects.push( new GameObject("arcikan","arcikan","nerast",50,50,5700,390,arcikanImg,0,0,0,1,1) );
			}

		});

		this.socket.on('goal', (data) => {
			let object = this.world.stage.quest.getObject(data.objName);
			object.setPosition(data.objX,data.objY);
			this.world.stage.quest.goal(object);
		});

		this.socket.on('drive forward', () => {
			this.story.drivingCar_scene(this);
		});

		this.socket.on('drive backward', () => {
			this.story.drivingCarBack_scene(this);
		});

		this.socket.on('quest done', () => {
			this.world.stage.quest.win(this);
		});

		this.socket.on('back to game', () => {
			window.cancelAnimationFrame(this.world.stage.quest.request);
			this.world.player.controlBlock = false;
			this.world.stage.quest.controlBlock = true;
			this.gameLoop();
		});

	}

	start() {
		this.menu.hide();
		this.receiveMessages();
		this.world.player.control(this);
		this.gameLoop();
	}

	gameLoop(timestamp) {

		// vypocet FPS
		if(this.lastCalledTime == null) {
		    this.lastCalledTime = Date.now();
		    this.fps = 0;
	  	}
	  	else {
		  	let deltaFps = (Date.now() - this.lastCalledTime)/1000;
		  	this.lastCalledTime = Date.now();
		  	this.fps = Math.round(1/deltaFps);
		}

		// vykonavanie animacie podla poctu fps
		let delta = timestamp - this.lastFrameTimeMs; 
		this.lastFrameTimeMs = timestamp;

    	while (delta >= this.timestep - 0.01) {
        
	    	this.world.player.moving(this);
			this.world.player.sendPosition(this); 
			this.world.collisionsUpdate();
			this.world.collisionsCheck(this);
			this.world.gravity();
			this.canvas.redraw(this);

			let loopingObjects = this.world.stage.objects.filter( (obj) => { return obj.looping == 1; } );
			loopingObjects.forEach((obj) => {
				obj.loop();
			});

        	delta -= this.timestep;
    	}

		this.request = window.requestAnimationFrame(this.gameLoop.bind(this));

	}

	waiting() {

		this.menu.hide();
		this.canvas.ctx.drawImage(this.findImage("waiting_bg"),0,0,this.canvas.cW,this.canvas.cH);
		this.canvas.ctx.fillStyle = "#000000";
		this.canvas.ctx.fillRect(0,225,800,50);
		this.canvas.ctx.fillStyle = "#ffffff";
		this.canvas.ctx.font = "33px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillText("Čaká sa na pripojenie spoluhráča..",165,262);

		this.socket.on('player join', () => {
			this.story.start(this);
		});

	}

	end(reason) {

		window.cancelAnimationFrame(this.request);
		window.cancelAnimationFrame(this.story.request);

		switch(reason){

			case "teammate disconnected":
				this.world.player.controlBlock = true;
				this.menu.show_message("Tvoj spoluhráč sa odpojil.",true);
				break;

			case "win":
				this.world.player.controlBlock = true;
				this.menu.show_message("Gratulujeme. Vyhrali ste :)",true);
				break;

			default:

		}

	}

}


/* **************************************************************************************** */
/* ********************************** Class Button **************************************** */
/* **************************************************************************************** */

class Button {

	constructor(name,text,active,x,y,w,h,active_img,inactive_img) {
		this.name = name;
		this.text = text;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.active_image = active_img;
		this.inactive_image = inactive_img;
		this.active = active;
	}

	click(click_x,click_y) {
		
		if(click_x > this.x && click_x < (this.x + this.width) && click_y > this.y && click_y < (this.y + this.height)) 
			return true;

		return false;

	}

	activate() {
		this.active = true;
	}

	deactivate() {
		this.active = false;
	}

	render(ctx) {

		if(this.active) 
			ctx.drawImage(this.active_image,this.x,this.y,this.width,this.height);
		else 	
			ctx.drawImage(this.inactive_image,this.x,this.y,this.width,this.height);

		ctx.font = "bold 16px 'Ubuntu', sans-serif";
		ctx.fillStyle = "#000000";
		if(this.text != null) ctx.fillText(this.text,this.x+20, this.y+22);

	}

}


/* **************************************************************************************** */
/* ************************************* Class InfoBox ************************************ */
/* **************************************************************************************** */

class InfoBox {

	constructor(w,h,x,y,img) {
		this.width = w;
		this.height = h;
		this.x = x;
		this.y = y;
		this.img = img;
	}


	render(game) {

		game.canvas.ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
		game.canvas.ctx.font = "bold 16px 'Ubuntu', sans-serif";
		game.canvas.ctx.fillStyle = "#000000";

		if(game.world.stage.questAvailable == 1) {
			game.canvas.ctx.fillText("Stlač 'ENTER'",this.x+15,this.y+25);
		}
		else if(game.world.player.canPickUp != null) {
			game.canvas.ctx.fillText("Zobrať - 'SPACE'",this.x+15,this.y+25);
		}
		else {
			game.canvas.ctx.fillText(game.world.stage.mission,this.x+15, this.y+25);
		}

	}

}


/* **************************************************************************************** */
/* ************************************ Class DialogBox *********************************** */
/* **************************************************************************************** */

class DialogBox {

	constructor(game,text,x,y,w,h,img) {
		
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.text = text;
		this.img = img;
		this.visible = false;
		this.controlBlock = true;

		let buttonImg = game.findImage("button");
		this.confirm_button = new Button("ukoncit_hru","ÁNO",true,this.x+110,this.y+80,80,30,buttonImg,null);
		this.decline_button = new Button("pokracovat","NIE",true,this.x+210,this.y+80,80,30,buttonImg,null);

		this.control(game);

	}

	show() {
		this.visible = true;
		this.controlBlock = false;
	}

	hide() {
		this.visible = false;
		this.controlBlock = true;
	}

	control(game) {

		/*********************** CLICK ***********************************/

		game.canvas.element.addEventListener('click', (event) => {

			if(!this.controlBlock) {
				
				var rect = game.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				if(this.confirm_button.click(click_x,click_y)) {
					location.reload();
					game.socket.emit("teammate disconnected");
				}

				if(this.decline_button.click(click_x,click_y)) {
					this.hide();
					game.world.player.controlBlock = false;
				}

			}

		});

	}

	render(ctx) {
		if(this.visible) {
			ctx.drawImage(this.img,this.x,this.y,this.width,this.height);
			ctx.font = "bold 16px 'Ubuntu', sans-serif";
			ctx.fillStyle = "#000000";
			ctx.fillText(this.text,this.x+110, this.y+50);
			this.confirm_button.render(ctx);
			this.decline_button.render(ctx);
		}
	}

}