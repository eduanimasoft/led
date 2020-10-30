"strict mode"

/* **************************************************************************************** */
/* ************************************** Class Room ************************************** */
/* **************************************************************************************** */

class Room {
	
	constructor(id,name,password,player_socket,charType) {

		this.id = id;
		this.name = name;
		this.password = password;
		this.players = new Array(); 
		var playerInfo = new Array(player_socket,charType); //socket.id hracov ktory su v roomke a character type
		this.players.push(playerInfo);

	}

	isHere(socket) {

		for(let i = 0; i < this.players.length; i++){
			if(socket == this.players[i][0]) return true;
		}
		return false;
	}

}

/* **************************************************************************************** */
/* ************************************** Class Server ************************************ */
/* **************************************************************************************** */

class Server {

	constructor(port) {

		this.express = require('express');
		this.app = this.express();
		this.path = require('path');
		this.server = require('http').createServer(this.app);
		this.io = require('socket.io').listen(this.server);

		this.server.listen(process.env.PORT || port);

		this.app.use(this.express.static(this.path.join(__dirname,'./')));

		this.app.get('/', function (req, res) {
			res.sendfile(__dirname + '/index.html');
		});

		this.rooms = new Array();

	}

	getRoomID(socket_id) {

		var roomid = 0;

		this.rooms.forEach((room) => {
			if(room.isHere(socket_id) == true) roomid = room.id;
		});

		return roomid;

	}

	deleteRoom(roomid) {
	
		this.rooms.forEach((room,i) => {
			if(room.id == roomid) this.rooms.splice(i,1);
		});

	}

	start() {

		this.io.on('connection', (socket) => {

			// on CREATE ROOM
			socket.on('create room', (data) => {

				var newRoom = new Room(data.id, data.name, data.password, socket.id, data.charType);
				this.rooms.push(newRoom);
				socket.join(data.id);

			});


			// on LIST ROOMS
			socket.on('list rooms', () => {
				socket.emit('list rooms', this.rooms);
			});


			// on JOIN ROOM
			socket.on('join room', (roomid) => {
				
				let room = this.rooms.filter((room) => {
					return room.id == roomid;
				});

				if(!room[0].password) this.publicRoom_join(socket,room[0]);
				else socket.emit('need password',roomid);

			});


			// on SEND PASSWORD
			socket.on('send password', (data) => {

				let room = this.rooms.filter((room) => {
					return room.id == data.roomid;
				});

				this.privateRoom_join(socket,room[0],data.password);

			});


			// on SEND POSITION
			socket.on('position', (data) => {
				socket.broadcast.to(data.room).emit('position', data);
			});

			// on CREATE GAMEOBJECT
			socket.on('create gameObject', (data) => {
				let roomid = this.getRoomID(data.sid);
				socket.broadcast.to(roomid).emit('create gameObject', { name: data.name, type: data.type, desc: data.desc, w: data.w, h: data.h, x: data.x, y: data.y, imgSrc: data.imgSrc });
			});

			// on DELETE OBJECT
			socket.on('delete object', (data) => {
				let roomid = this.getRoomID(data.sid);
				socket.broadcast.to(roomid).emit('delete object', data.object);
			});

			// on START QUEST
			socket.on('start quest', (sid) => {
				let roomid = this.getRoomID(sid);
				socket.broadcast.to(roomid).emit('start quest');
			});

			// on TASK DONE
			socket.on('task done', (data) => {
				let roomid = this.getRoomID(data.sid);
				socket.broadcast.to(roomid).emit('task done', data.task);
			});

			// on REMOVING BARRIER
			socket.on('removing barrier', (sid) => {
				let roomid = this.getRoomID(sid);
				socket.broadcast.to(roomid).emit('removing barrier');
			});

			// on NOT REMOVING BARRIER
			socket.on('not removing barrier', (sid) => {
				let roomid = this.getRoomID(sid);
				socket.broadcast.to(roomid).emit('not removing barrier');
			});

			// on BARRIER MOVED
			socket.on('barrier moved', (sid) => {
				let roomid = this.getRoomID(sid);
				socket.broadcast.to(roomid).emit('barrier moved');
			});

			// on BARRIER REMOVED
			socket.on('barrier removed', () => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('barrier removed');
			});

			// on SHOW CARD
			socket.on('show card', (data) => {
				let roomid = this.getRoomID(data.sid);
				socket.broadcast.to(roomid).emit('show card',data.card);
			});

			// on HIDE CARDS
			socket.on('hide cards', (data) => {
				let roomid = this.getRoomID(data.sid);
				socket.broadcast.to(roomid).emit('hide cards', { card1: data.card1, card2:data.card2 });
			});

			// on PAIR FOUND
			socket.on('pair found', (sid) => {
				let roomid = this.getRoomID(sid);
				socket.broadcast.to(roomid).emit('pair found');
			});

			// on POTENTIOMETER SWITCHED
			socket.on('potentiometer switched', (data) => {
				let roomid = this.getRoomID(data.sid);
				socket.broadcast.to(roomid).emit('potentiometer switched',data);
			});

			// on QUEST DONE
			socket.on('quest done', () => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('quest done');
			});

			// on PIN ITEM
			socket.on('pin item', (data) => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('pin item',data);
			});

			// on BACK TO GAME
			socket.on('back to game', (sid) => {
				let roomid = this.getRoomID(sid);
				socket.broadcast.to(roomid).emit('back to game');
			});

			// on FILL SPOT
			socket.on('fill spot', (data) => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('fill spot',data);
			});

			// on TIMER CHANGED
			socket.on('timer changed', (data) => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('timer changed',data);
			});

			// on MINE
			socket.on('mine', () => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('mine');
			});

			// on GOAL
			socket.on('goal', (data) => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('goal',data);
			});

			// on MINERAL
			socket.on('mineral', () => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('mineral');
			});

			// on DRIVE FORWARD
			socket.on('drive forward', () => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('drive forward');
			});

			// on DRIVE BACKWARD
			socket.on('drive backward', () => {
				let roomid = this.getRoomID(socket.id);
				socket.broadcast.to(roomid).emit('drive backward');
			});

			// on DISCONNECT
			socket.on('disconnect', () => {

				let roomid = this.getRoomID(socket.id);
				// sprava do miestonsti ze sa spoluhrac odpojil
				socket.broadcast.to(roomid).emit('teammate disconnected');
				//vymazat miestnost z this.rooms
				this.deleteRoom(roomid);

			});

		});

	}

	publicRoom_join(socket,room) {

		if(room.players.length < 2) {

			// ak nie je nastavene heslo
			if(!room.password) {	
		
				var charType = "";
				// zisti aky typ charakteru ma vybrany hrac ktory uz je v roomke a dalsiemu nastavy zostavajuci typ
				if (room.players[0][1] == "electron") {
					charType = "photon";
				}
				else if (room.players[0][1] == "photon"){
					charType = "electron";
				}

				socket.join(room.id);
				var player = new Array(socket.id, charType);
				room.players.push(player);
				socket.emit('join room', charType);
				socket.broadcast.to(room.id).emit('player join');

			}

		}
		else {
			socket.emit('room is full');
		}

	}

	privateRoom_join(socket,room,pass) {

		if(room.players.length < 2) {

			// ak bolo zadane spravne heslo
			if(room.password == pass){

				var charType = "";
				// zisti aky typ charakteru ma vybrany hrac ktory uz je v roomke a dalsiemu nastavy zostavajuci typ
				if (room.players[0][1] == "electron") {
					charType = "photon";
				}
				else if (room.players[0][1] == "photon"){
					charType = "electron";
				}

				socket.join(room.id);
				var player = new Array(socket.id, charType);
				room.players.push(player);
				socket.emit('join room', charType);
				socket.broadcast.to(room.id).emit('player join');

			}
			else {
				socket.emit('incorrect password');
			}

		}
		else{
			socket.emit('room is full');
		}

	}


}

var server = new Server(3000);
server.start();