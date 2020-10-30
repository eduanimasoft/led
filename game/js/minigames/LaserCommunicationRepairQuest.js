/* **************************************************************************************** */
/* ************************ Class LaserCommunicationRepairQuest *************************** */
/* **************************************************************************************** */

class LaserCommunicationRepairQuest extends FixCircuitMiniGame {

	constructor(game,name,MGobj) {

		let bgImg = game.findImage("minigame_bg");
		let infoImg = game.findImage("LaserComRepairQuest_Info");
		super(game,name,MGobj,game.canvas,bgImg,[infoImg]);

		this.circuitImg = game.findImage("laserCom_circuit");
		this.circuitStartX = 50;
		this.circuitStartY = 76;

		this.description = "Zostavte obvod s laserovou komunikáciou, zapojením komponentov, ktoré musíte zozbierať na stanici.";

		this.spot1_objectName = "laser_item";
		this.spot2_objectName = "solarCell";
		this.spot3_objectName = "accumulator";
		this.spot4_objectName = "audioAmplifier";
		this.spot5_objectName = "audioTransformer";
		this.spot6_objectName = "medium";

		this.spot1_img = game.findImage("laser_item");
		this.spot2_img = game.findImage("solarCell");
		this.spot3_img = game.findImage("accumulator");
		this.spot4_img = game.findImage("audioAmp");
		this.spot5_img = game.findImage("audioTransf");
		this.spot6_img = game.findImage("ACdevice");

		let spotImg = game.findImage("spotImg");
		this.spot1 = new Spot(spotImg,this.spot1_objectName,60,50,80,80);	// laser item
		this.spot2 = new Spot(spotImg,this.spot2_objectName,320,50,80,80);	// solar cell
		this.spot3 = new Spot(spotImg,this.spot3_objectName,60,310,80,80);	// accumulator
		this.spot4 = new Spot(spotImg,this.spot4_objectName,580,140,80,80);	// audio amplifier		
		this.spot5 = new Spot(spotImg,this.spot5_objectName,320,190,80,80); // audio transformer
		this.spot6 = new Spot(spotImg,this.spot6_objectName,580,310,80,80); // medium

	}

	win(game) {
		window.cancelAnimationFrame(this.request);
		this.controlBlock = true; // zablokuje ovladanie minihry
		game.world.switchStage(3,game);
		game.story.passage_stage2(game);
	}

}