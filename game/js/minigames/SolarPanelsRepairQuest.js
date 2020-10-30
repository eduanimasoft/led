/* **************************************************************************************** */
/* ***************************** Class SolarPanelsRepairQuest ***************************** */
/* **************************************************************************************** */

class SolarPanelsRepairQuest extends FixCircuitMiniGame {

	constructor(game,name,MGobj) {

		let bgImg = game.findImage("SolarPanelsRepairQuest_bg");
		let infoImg = game.findImage("SolarPanelsRepairQuest_Info");
		super(game,name,MGobj,game.canvas,bgImg,[infoImg]);

		this.circuitImg = game.findImage("solarPanel_circuit");
		this.circuitStartX = 67;
		this.circuitStartY = 85;

		this.description = "Zostavte obvod so solárnymi panelmi, zapojením komponentov, ktoré musíte zozbierať na stanici.";

		this.spot1_objectName = "solarPanel";
		this.spot2_objectName = "regulator";
		this.spot3_objectName = "accumulator1";
		this.spot4_objectName = "accumulator2";
		this.spot5_objectName = "converter";
		this.spot6_objectName = "ACdevice";

		this.spot1_img = game.findImage("solarPanel");
		this.spot2_img = game.findImage("regulator");
		this.spot3_img = game.findImage("accumulator");
		this.spot4_img = game.findImage("accumulator");
		this.spot5_img = game.findImage("converter");
		this.spot6_img = game.findImage("ACdevice");

		let spotImg = game.findImage("spotImg");
		this.spot1 = new Spot(spotImg,this.spot1_objectName,80,70,80,80);
		this.spot2 = new Spot(spotImg,this.spot2_objectName,270,135,80,80);	
		this.spot5 = new Spot(spotImg,this.spot3_objectName,500,210,80,80);
		this.spot3 = new Spot(spotImg,this.spot4_objectName,265,310,80,80);
		this.spot4 = new Spot(spotImg,this.spot5_objectName,410,310,80,80);	
		this.spot6 = new Spot(spotImg,this.spot6_objectName,620,210,80,80);

	}

	win(game) {
		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.world.switchStage(2,game);
		game.story.passage_stage1(game);
	}

}