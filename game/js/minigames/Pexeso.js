/* **************************************************************************************** */
/* ************************************* Class Card *************************************** */
/* **************************************************************************************** */

class Card extends Sprite {

	constructor(name,pair,w,h,x,y,img,rubImg,cb_red,cb_blue) {

		super(w,h,x,y,img,0,0,0,0,1);
		this.name = name;
		this.rubImg = rubImg;
		this.activeImg = this.rubImg;
		this.turned = false;
		this.pair = pair;
		this.turnedBy = null;
		this.card_border_red_img = cb_red;
		this.card_border_blue_img = cb_blue;
		
	}

	show() {
		this.activeImg = this.img;
		this.turned = true;
	}

	hide() {
		this.activeImg = this.rubImg;
		this.turned = false;
	}

	render(ctx) {
		ctx.drawImage(this.activeImg,this.x,this.y,this.width,this.height);
		if(this.turned && this.turnedBy == "electron") ctx.drawImage(this.card_border_blue_img,this.x,this.y,this.width,this.height);
		else if(this.turned && this.turnedBy == "photon") ctx.drawImage(this.card_border_red_img,this.x,this.y,this.width,this.height);
	}

}


/* **************************************************************************************** */
/* ************************************* Class Pexeso ************************************* */
/* **************************************************************************************** */

class Pexeso extends MiniGame {

	constructor(game,name,MGobj) {
		
		let tasksForPlayer = 4;
		let infoImg = game.findImage("pexeso_info");
		super(name,MGobj,game.canvas,tasksForPlayer,[infoImg]);

		this.description = "Spoločne nájdite všetky dvojice LED diód.";

		this.bgImg = game.findImage("minigame_bg");
		this.cards = [];
		this.turnedCard = null;
		this.canTurn = true;
		this.numOfPairs = 0;

		this.createCards(game);
		this.shuffle();

		this.control(game);

	}

	createCards(game) {

		/********************* CREATE CARDS ***********************/
		
		let rubImg = game.findImage("card_rub");
		let cb_red_img = game.findImage("card_border_red");
		let cb_blue_img = game.findImage("card_border_blue");

		let blue_diode_img = game.findImage("blue_diode");
		let blue_diode_pair_img = game.findImage("blue_diode_pair");
		this.cards.push( new Card("blue_diode","blue_diode",100,100,0,0,blue_diode_img,rubImg,cb_red_img,cb_blue_img) );
		this.cards.push( new Card("blue_diode_pair","blue_diode",100,100,0,0,blue_diode_pair_img,rubImg,cb_red_img,cb_blue_img) );

		let red_diode_img = game.findImage("red_diode");
		let red_diode_pair_img = game.findImage("red_diode_pair");
		this.cards.push( new Card("red_diode","red_diode",100,100,0,0,red_diode_img,rubImg,cb_red_img,cb_blue_img) );
		this.cards.push( new Card("red_diode_pair","red_diode",100,100,0,0,red_diode_pair_img,rubImg,cb_red_img,cb_blue_img) );

		let yellow_diode_img = game.findImage("yellow_diode");
		let yellow_diode_pair_img = game.findImage("yellow_diode_pair");
		this.cards.push( new Card("yellow_diode","yellow_diode",100,100,0,0,yellow_diode_img,rubImg,cb_red_img,cb_blue_img) );
		this.cards.push( new Card("yellow_diode_pair","yellow_diode",100,100,0,0,yellow_diode_pair_img,rubImg,cb_red_img,cb_blue_img) );

		let orange_diode_img = game.findImage("orange_diode");
		let orange_diode_pair_img = game.findImage("orange_diode_pair");
		this.cards.push( new Card("orange_diode","orange_diode",100,100,0,0,orange_diode_img,rubImg,cb_red_img,cb_blue_img) );
		this.cards.push( new Card("orange_diode_pair","orange_diode",100,100,0,0,orange_diode_pair_img,rubImg,cb_red_img,cb_blue_img) );

		let green_diode_img = game.findImage("green_diode");
		let green_diode_pair_img = game.findImage("green_diode_pair");
		this.cards.push( new Card("green_diode","green_diode",100,100,0,0,green_diode_img,rubImg,cb_red_img,cb_blue_img) );
		this.cards.push( new Card("green_diode_pair","green_diode",100,100,0,0,green_diode_pair_img,rubImg,cb_red_img,cb_blue_img) );

		let white_diode_img = game.findImage("white_diode");
		let white_diode_pair_img = game.findImage("white_diode_pair");
		this.cards.push( new Card("white_diode","white_diode",100,100,0,0,white_diode_img,rubImg,cb_red_img,cb_blue_img) );
		this.cards.push( new Card("white_diode_pair","white_diode",100,100,0,0,white_diode_pair_img,rubImg,cb_red_img,cb_blue_img) );

		let rgb_diode_img = game.findImage("rgb_diode");
		let rgb_diode_pair_img = game.findImage("rgb_diode_pair");
		this.cards.push( new Card("rgb_diode","rgb_diode",100,100,0,0,rgb_diode_img,rubImg,cb_red_img,cb_blue_img) );
		this.cards.push( new Card("rgb_diode_pair","rgb_diode",100,100,0,0,rgb_diode_pair_img,rubImg,cb_red_img,cb_blue_img) );

		let infrared_diode_img = game.findImage("infrared_diode");
		let infrared_diode_pair_img = game.findImage("infrared_diode_pair");
		this.cards.push( new Card("infrared_diode","infrared_diode",100,100,0,0,infrared_diode_img,rubImg,cb_red_img,cb_blue_img) );
		this.cards.push( new Card("infrared_diode_pair","infrared_diode",100,100,0,0,infrared_diode_pair_img,rubImg,cb_red_img,cb_blue_img) );

	}

	shuffle() {

		/*************** RANDOM SET ****************/

		for(let i=0; i<this.cards.length; i++) {
			let randomIndex = Math.floor(Math.random() * 100)%(16-i);
			let removedCard = this.cards[randomIndex];
			this.cards.splice(randomIndex,1);
			this.cards.push(removedCard);
		}

		this.cards.forEach((card,i) => {

			if((i%4) == 0) card.setPosition(150,card.y);
			else if((i%4) == 1) card.setPosition(255,card.y);
			else if((i%4) == 2) card.setPosition(360,card.y);
			else if((i%4) == 3) card.setPosition(465,card.y);

			if(i < 4) card.setPosition(card.x,45);
			else if(i >= 4 && i < 8) card.setPosition(card.x,150);
			else if(i >= 8 && i < 12) card.setPosition(card.x,255);
			else if(i >= 12) card.setPosition(card.x,360);

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

				if(this.canTurn && this.solvedTasks < this.NumTasksForPlayer) {

					this.cards.forEach((card) => {

						if(card.turned == false && click_x > card.x && click_x < (card.x + card.width) && click_y > card.y && click_y < ((card.y + card.height))) {
							
							card.turnedBy = game.world.player.type;

							if(this.turnedCard != null) {
								
								game.socket.emit('show card', { sid: game.socket.id, card: card });
								card.show();
								this.canTurn = false;

								if(card.pair != this.turnedCard.pair) {

									setTimeout(() => {
										game.socket.emit('hide cards', { sid: game.socket.id, card1: card, card2: this.turnedCard });
										card.hide();
										this.turnedCard.hide();
										this.turnedCard = null;
										this.canTurn = true;
									}, 1000);
								
								}
								else { //ak nasiel par
									game.socket.emit('pair found', game.socket.id);
									this.solvedTasks++;
									this.turnedCard = null;
									this.canTurn = true;
									this.pairFound(game);
								}

							}
							else{
								game.socket.emit('show card', { sid: game.socket.id, card: card });
								this.turnedCard = card;
								card.show();
							}

						}

					});

				}

			}

		});

	}

	pairFound(game) {
		this.numOfPairs++;
		this.checkPairs();
	}

	win(game) {
		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.world.player.controlBlock = false; // odblokuje ovladanie hry
		game.gameLoop();
		game.world.stage.getObjectByName("door1").open();
		let trigger = game.world.stage.getObjectByName("door1_trigger");
		game.world.stage.deleteObject(trigger);
	}

	getCard(findCard) {

		var returnedcard = null;

		this.cards.forEach((card) => {
			if(card.name == findCard.name) {
				returnedcard = card;
			}
		});

		return returnedcard;
	}

	checkPairs() {
		if(this.numOfPairs == 8) this.confirm_button.activate();
		else this.confirm_button.deactivate();
	}

	render() {

		this.preRender();

		// vykreslenie kariet
		this.cards.forEach((card) => {
			card.render(this.canvas.ctx);
		});

		this.canvas.ctx.font = "bold 18px 'Ubuntu', sans-serif";
		this.canvas.ctx.fillStyle = "#000000";

		this.canvas.ctx.fillText(this.description,195,25);

		if(this.numOfPairs < 8 && this.solvedTasks >= this.NumTasksForPlayer) {
			this.canvas.ctx.font = "bold 20px 'Ubuntu', sans-serif";
			this.canvas.ctx.fillStyle = "#f21010";
			this.canvas.ctx.fillText("Našiel si polovicu párov, ostatné nechaj na tvojho spoluhráča.",80,485);
		} 

	}

}