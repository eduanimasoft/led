/* **************************************************************************************** */
/* ********************************* Class Switch ***************************************** */
/* **************************************************************************************** */

class Switch extends Sprite {

	constructor(name,w,h,x,y,img,curPos,positions,values) {
		
		super(w,h,x,y,img,0,0,0,0,1);
		this.name = name;
		this.switch_position = curPos; // 0,1,2 <---------------------------------------------
		this.positions = positions; // pole moznych X pozicii , index = switch_position |
		this.values = values;
		this.value = this.values[this.switch_position];

	}

	changePosition(pos) {

		this.switch_position = pos;
		this.x = this.positions[pos];
		this.value = this.values[this.switch_position];

	}

	render(ctx) {

		ctx.drawImage(this.img,this.x,this.y,this.width,this.height);

		ctx.font = "bold 18px 'Ubuntu', sans-serif";
		ctx.fillStyle = "#000000";
		ctx.fillText(this.value+" Ω",this.positions[1]-20,this.y-20);

	}

}


/* **************************************************************************************** */
/* ********************************* Class RgbLedQuest ************************************ */
/* **************************************************************************************** */

class RgbLedQuest extends MiniGame {

	constructor(game,name,MGobj) {

		let tasksForPlayer = 3;  
		let infoImg1 = game.findImage("RgbLedQuest_Info1");
		let infoImg2 = game.findImage("RgbLedQuest_Info2");
		super(name,MGobj,game.canvas,tasksForPlayer,[infoImg1,infoImg2]);
		
		this.bgImg = game.findImage("minigame_bg");
		this.questDone = [false, false, false];
		this.description = "Nastav odpory na jednotlivých diódach tak, aby RGB LED svietila ako zelená.";

		this.switch_control = null; // ktory switch prave ovlada
		this.rgb_colors = [255,0,0]; // [red,green,blue]

		this.circuit = game.findImage("RGBLED_circuit");
		let switchImg = game.findImage("switch"); 
		this.redLED_switch = new Switch("redLED_switch",10,30,115,140,switchImg,0,[115,160,200],[150,300,6000]);
		this.greenLED_switch = new Switch("greenLED_switch",10,30,200,237,switchImg,2,[115,160,200],[90,180,3600]);
		this.blueLED_switch = new Switch("blueLED_switch",10,30,200,332,switchImg,2,[115,160,200],[90,180,3600]);
		this.RGBLED = game.findImage("RGBLED"); 
		this.RGBLED_obrys = game.findImage("RGBLED_obrys");

		this.control(game);

	}

	control(game) {

		/*********************** MOUSE DOWN ***************************************/

		this.canvas.element.addEventListener('mousedown', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				if(click_x > (this.redLED_switch.x - 10) && click_x < (this.redLED_switch.x + this.redLED_switch.width + 10) && click_y > this.redLED_switch.y && click_y < ((this.redLED_switch.y + this.redLED_switch.height))) {
					this.switch_control = this.redLED_switch;
				}
				else if(click_x > (this.greenLED_switch.x - 10) && click_x < (this.greenLED_switch.x + this.greenLED_switch.width + 10) && click_y > this.greenLED_switch.y && click_y < ((this.greenLED_switch.y + this.greenLED_switch.height))) {
					this.switch_control = this.greenLED_switch;
				}
				else if(click_x > (this.blueLED_switch.x - 10) && click_x < (this.blueLED_switch.x + this.blueLED_switch.width + 10) && click_y > this.blueLED_switch.y && click_y < ((this.blueLED_switch.y + this.blueLED_switch.height))) {
					this.switch_control = this.blueLED_switch;
				}

			}

		});


		/*********************** MOUSE MOVE **************************************/

		this.canvas.element.addEventListener('mousemove', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var mouse_pos_x = event.clientX - rect.left;
				var mouse_pos_y = event.clientY - rect.top;

				if(this.switch_control != null) {

					if(this.switch_control.switch_position == 0 && mouse_pos_x > (this.switch_control.positions[1] - 15)) {
						this.switch_control.changePosition(1);
						if(this.switch_control.name == "redLED_switch") this.rgb_colors[0] = 127;
						else if(this.switch_control.name == "greenLED_switch") this.rgb_colors[1] = 127;
						else if(this.switch_control.name == "blueLED_switch") this.rgb_colors[2] = 127;
						game.socket.emit('potentiometer switched', { sid: game.socket.id, position: 1, switch_name: this.switch_control.name});
					}
					else if(this.switch_control.switch_position == 1 && mouse_pos_x > (this.switch_control.positions[2] - 15)) {
						this.switch_control.changePosition(2);
						if(this.switch_control.name == "redLED_switch") this.rgb_colors[0] = 0;
						else if(this.switch_control.name == "greenLED_switch") this.rgb_colors[1] = 0;
						else if(this.switch_control.name == "blueLED_switch") this.rgb_colors[2] = 0;
						game.socket.emit('potentiometer switched', { sid: game.socket.id, position: 2, switch_name: this.switch_control.name});
					}
					else if(this.switch_control.switch_position == 1 && mouse_pos_x < (this.switch_control.positions[0] + 25)) {
						this.switch_control.changePosition(0);
						if(this.switch_control.name == "redLED_switch") this.rgb_colors[0] = 255;
						else if(this.switch_control.name == "greenLED_switch") this.rgb_colors[1] = 255;
						else if(this.switch_control.name == "blueLED_switch") this.rgb_colors[2] = 255;
						game.socket.emit('potentiometer switched', { sid: game.socket.id, position: 0, switch_name: this.switch_control.name});
					}
					else if(this.switch_control.switch_position == 2 && mouse_pos_x < (this.switch_control.positions[1] + 25)) {
						this.switch_control.changePosition(1);
						if(this.switch_control.name == "redLED_switch") this.rgb_colors[0] = 127;
						else if(this.switch_control.name == "greenLED_switch") this.rgb_colors[1] = 127;
						else if(this.switch_control.name == "blueLED_switch") this.rgb_colors[2] = 127;
						game.socket.emit('potentiometer switched', { sid: game.socket.id, position: 1, switch_name: this.switch_control.name});
					}

				}

			}

		});


		/*********************** MOUSE UP *****************************************/

		this.canvas.element.addEventListener('mouseup', (event) => {

			if(!this.controlBlock) {

				var rect = this.canvas.element.getBoundingClientRect();
				var click_x = event.clientX - rect.left;
				var click_y = event.clientY - rect.top;

				this.switch_control = null;

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

	checkDone() {
		if(this.rgb_colors[0] == 0 && this.rgb_colors[1] == 255 && this.rgb_colors[2] == 0) {
			this.confirm_button.activate();
		}
		else {
			this.confirm_button.deactivate();
		}
	}

	win(game) {
		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.world.player.controlBlock = false; // odblokuje ovladanie hry
		game.gameLoop();
		game.world.stage.getObjectByName("door2").open();
		let trigger = game.world.stage.getObjectByName("door2_trigger");
		game.world.stage.deleteObject(trigger);
	}

	render() {
		
		this.canvas.ctx.clearRect(0,0,this.canvas.cW,this.canvas.cH);

		// vykreslenie background-u
		this.canvas.ctx.drawImage(this.bgImg,0,0,this.canvas.cW,this.canvas.cH);

		// vykreslenie buttonov
		this.confirm_button.render(this.canvas.ctx);
		this.exit_button.render(this.canvas.ctx);
		this.info_button.render(this.canvas.ctx);

		// vykreslenie farby RGB LED diody v zavislosti od nastavenych odporov 
		
		if(this.rgb_colors[0] == 0 && this.rgb_colors[1] == 0 && this.rgb_colors[2] == 0) 
			this.canvas.ctx.fillStyle = "rgb(90, 90, 90)";
		else
			this.canvas.ctx.fillStyle = "rgb("+this.rgb_colors[0]+","+this.rgb_colors[1]+","+this.rgb_colors[2]+")";		 

	    this.canvas.ctx.fillRect(250,80,40,400);
	    this.canvas.ctx.fillRect(290,107,220,343);
	    this.canvas.ctx.beginPath();
		this.canvas.ctx.arc(510,278,171,0,2*Math.PI);
		this.canvas.ctx.fill();

		// vykreslenie obvodu a switchov
	    this.canvas.ctx.drawImage(this.RGBLED_obrys,250,80,this.RGBLED.width,this.RGBLED.height);
		this.canvas.ctx.drawImage(this.circuit,15,80,this.circuit.width,this.circuit.height);
		this.redLED_switch.render(this.canvas.ctx);
		this.greenLED_switch.render(this.canvas.ctx);
		this.blueLED_switch.render(this.canvas.ctx);

		// vypisanie popisu ulohy
		game.canvas.ctx.font = "bold 18px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";
		this.canvas.ctx.fillText(this.description,40,30);

	}

}