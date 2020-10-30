/* **************************************************************************************** */
/* ************************************** Class Physics *********************************** */
/* **************************************************************************************** */

class Physics {

	constructor () {
		this.gravity = 2;
	}

	// detekuje vsetky kolizie v realnom case
	collisionDetection (world,collider) { 

		if(collider == "player") {

			let collisionArray = [];
			let j = 0;
			let playerStartX = world.player.x;	// zaciatocna x-ova pozicia hraca
			let playerEndX = world.player.x + world.player.width;	// koncova x-ova pozicia hraca
			let playerStartY = world.player.y;	// zaciatocna y-ova pozicia hraca
			let playerEndY = world.player.y + world.player.height;	// koncova y-ova pozicia hraca

			for (let i = 0; i < world.stage.objects.length; i++) {
			
				let objectStartX = world.stage.objects[i].x;
				let objectEndX = world.stage.objects[i].x + world.stage.objects[i].width;
				let objectStartY = world.stage.objects[i].y;
				let objectEndY = world.stage.objects[i].y + world.stage.objects[i].height;

				if ((objectStartX <= playerStartX && objectEndX >= playerStartX) || (objectStartX >= playerStartX && objectStartX <= playerEndX) || (objectStartX <= playerStartX && objectEndX >= playerEndX) || (objectStartX >= playerStartX && objectEndX <= playerEndX)) {

					if ((objectStartY <= playerStartY && objectEndY >= playerStartY) || (objectStartY >= playerStartY && objectStartY <= playerEndY) || (objectStartY <= playerStartY && objectEndY >= playerEndY) || (objectStartY >= playerStartY && objectEndY <= playerEndY)) {

						collisionArray[j] = world.stage.objects[i];
						j++;			

					}

				}

			}

			return collisionArray;

		}
		else if(collider == "teammate") {

			let collisionArray = [];
			let j = 0;
			let teammateStartX = world.teammate.x;	// zaciatocna x-ova pozicia hraca
			let teammateEndX = world.teammate.x + world.teammate.width;	// koncova x-ova pozicia hraca
			let teammateStartY = world.teammate.y;	// zaciatocna y-ova pozicia hraca
			let teammateEndY = world.teammate.y + world.teammate.height;	// koncova y-ova pozicia hraca

			for (let i = 0; i < world.stage.objects.length; i++) {
			
				let objectStartX = world.stage.objects[i].x;
				let objectEndX = world.stage.objects[i].x + world.stage.objects[i].width;
				let objectStartY = world.stage.objects[i].y;
				let objectEndY = world.stage.objects[i].y + world.stage.objects[i].height;

				if ((objectStartX <= teammateStartX && objectEndX >= teammateStartX) || (objectStartX >= teammateStartX && objectStartX <= teammateEndX) || (objectStartX <= teammateStartX && objectEndX >= teammateEndX) || (objectStartX >= teammateStartX && objectEndX <= teammateEndX)) {

					if ((objectStartY <= teammateStartY && objectEndY >= teammateStartY) || (objectStartY >= teammateStartY && objectStartY <= teammateEndY) || (objectStartY <= teammateStartY && objectEndY >= teammateEndY) || (objectStartY >= teammateStartY && objectEndY <= teammateEndY)) {

						collisionArray[j] = world.stage.objects[i];
						j++;			

					}

				}

			}

			return collisionArray;

		}

	}

	// iba testuje ci by vznikla nova kolizia ak by sa zmenila pozicia hraca
	collisionTest (world, speed, jumpHeight) {

		// neberie naozajstnu poziciu hraca, iba taku aku by dosiahol pohybom (preto +speed) 
		let numberOfPotentionalCollisions = 0;
		let playerStartX = world.player.x + speed;	// zaciatocna x-ova pozicia hraca 
		let playerEndX = world.player.x + world.player.width + speed;	// koncova x-ova pozicia hraca
		let playerStartY = world.player.y + jumpHeight;	// zaciatocna y-ova pozicia hraca
		let playerEndY = world.player.y + world.player.height + jumpHeight;	// koncova y-ova pozicia hraca

		for (let i = 0; i < world.stage.objects.length; i++) {
		
			let objectStartX = world.stage.objects[i].x;
			let objectEndX = world.stage.objects[i].x + world.stage.objects[i].width;
			let objectStartY = world.stage.objects[i].y;
			let objectEndY = world.stage.objects[i].y + world.stage.objects[i].height;

			if ((objectStartX <= playerStartX && objectEndX >= playerStartX) || (objectStartX >= playerStartX && objectStartX <= playerEndX)) {

				if ((objectStartY <= playerEndY && objectEndY >= playerStartY) || (objectEndY >= playerStartY && objectStartY <= playerEndY)) {
					
					// ak je tento objekt solid (pevny = neda sa cez neho prejst) pripocitam koliziu
					if(world.stage.objects[i].solid == 1) numberOfPotentionalCollisions++; 

				}

			}

		}

		let collisionsReal = []; // pole kolizii teraz.. realne
		collisionsReal = this.collisionDetection(world,"player"); 
		let solidRealCollisions = this.numberOfSolid(collisionsReal); // pocet (solid) realnych kolizii.. teraz

		if (numberOfPotentionalCollisions > solidRealCollisions) {
			return 0; // ak bude po zmene viac kolizii vrati 0
		}
		else {
			return 1; // ak nebude po zmene viac kolizii vrati 1
		}

	}

	findSolid (ObjectArray) {

		let ret = [];

		ObjectArray.forEach((object) => {
			if(object.solid == 1) ret.push(object);
		});

		return ret;

	}

	footCollisionDetect(player) {

		let solidColls = this.findSolid(player.collisions);
		let footColl = false;

		solidColls.forEach((coll) => {
			if((player.y + player.height) <= coll.y) footColl = true;
		});

		return footColl;

	}

	headCollisionDetect(player) {

		let solidColls = this.findSolid(player.collisions); 
		let headColl = false;

		solidColls.forEach((coll) => {
			if(player.y > (coll.y + coll.height) || ((player.y <= (coll.y + coll.height) && player.y+player.height > (coll.y + coll.height)))) headColl = true;
		});

		return headColl;

	}

	numberOfSolid (ObjectArray) {

		let ret = 0;

		ObjectArray.forEach((object) => {
			if(object.solid == 1) ret = 1;
		});

		return ret;

	}

	gravityApply (world) { 

		// ak nie je v colissionArray nejaky "solid" objekt tak zvysuj y pokym taky nie je 
		let collisionArray = [];
		collisionArray = this.collisionDetection(world,"player");
		let solidObjects = this.findSolid(collisionArray);
		let footColl = false;

		solidObjects.forEach((sobj) => {
			if((world.player.y + world.player.height) <= sobj.y) footColl = true;
		});

		if(!footColl) {	
			world.player.setPosition(world.player.x, world.player.y+this.gravity); // zvysujeme y-ovu suradnicu
		}

	}

}