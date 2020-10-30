
/* **************************************************************************************** */
/* ************************************** Class Menu ************************************** */
/* **************************************************************************************** */

class Menu {

	constructor(game) {
		this.receiveMessages(game);
		this.joiningRoomId = null;
	}

	receiveMessages(game) {

		// server vratil spravu ze je miestnost plna
		game.socket.on('room is full', () => {
			this.show_message('Miestnost je plná.',false);
		});
		
		// server vratil spravu ze musis zadat heslo
		game.socket.on('need password', (roomid) => {
			this.createPasswordBox(roomid);
			this.show_passwordBox();
		});

		// server vratil spravu ze si zadal zle heslo
		game.socket.on('incorrect password', () => {
			this.show_message('Zadané heslo je nesprávne.',false);
		});

		// server vratil spravu ze si sa pripojil
		game.socket.on('join room', (charType) => {
			game.load(this.joiningRoomId,charType);
			game.story.start(game);
		});

	}

	hide() {
		document.getElementById('canvas').style.display="block";
		document.getElementById('list_room_tab').style.display="none";
		document.getElementById('create_room_form').style.display="none";
		document.getElementById('controls').style.display="none";
		document.getElementById('menu').style.display="none";
		document.getElementById('message_box').style.display="none";
		document.getElementById('password_box').style.display="none";
	}

	show() {
		document.getElementById('canvas').style.display="none";
		document.getElementById('list_room_tab').style.display="none";
		document.getElementById('create_room_form').style.display="none";
		document.getElementById('controls').style.display="none";
		document.getElementById('message_box').style.display="none";
		document.getElementById('password_box').style.display="none";
		document.getElementById('menu').style.display="block";
	}

	createRoom(game) {
		
		// generator room ID
		function generatorId() {
		    let id = "";
		    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 20; i++ )
		        id += charset.charAt(Math.floor(Math.random() * charset.length));

		    return id;
		}

		// vygenerovanie room ID a ziskanie informacii z formulara
		var id = generatorId(); 
		var name = document.getElementById('room_name').value;
		var password = document.getElementById('room_pass').value;
		var sub_create = document.getElementById('create_room').value;
		var typeElectron = document.getElementById('type_electron').checked;
		var typePhoton = document.getElementById('type_photon').checked;

		// validacia
		if(name.length >= 4 && name.length <= 25) {	

			if(typeElectron || typePhoton){

				var charType = "";

				if (typeElectron) {
					charType = "electron";
				}
				else if(typePhoton){
					charType = "photon"
				}

				game.socket.emit('create room', { id: id, name: name, password: password, charType: charType });
				game.load(id,charType);
				game.waiting(); 

			}
			else {
				this.show_message('Musíš vybrať typ postavy.',false);
			}

		}
		else{
			this.show_message('Meno musí obsahovať 4-25 znakov.',false);
		}

	}

	joinRoom(game,element) {
		this.joiningRoomId = element.id;
		// client odosle spravu ze sa chce pripojit
		game.socket.emit('join room', this.joiningRoomId);
	}

	sendPassword(roomid,password) {
		this.hide_passwordBox();
		game.socket.emit('send password', { roomid: roomid, password: password });
	}

	listRooms(game) {

		game.socket.emit('list rooms');
		
		game.socket.on('list rooms', (roomsArray) => {
		
			var rooms = [];
			rooms = roomsArray;
			var numOfRooms = rooms.length;

			var table = document.getElementById('room_list');
			table.innerHTML = "<tr><th> Názov </th><th> Heslo </th><th> Hráči </th><th> Pripojiť </th><tr>";

			document.getElementById('list_room_tab').style.display = "block";
			document.getElementById('create_room_form').style.display = "none";
			document.getElementById('controls').style.display = "none";

			for (var i=0; i<numOfRooms; i++) {
					
				var row = table.insertRow(i+1);
				var roomName = row.insertCell(0);
				var roomPass = row.insertCell(1);
				var roomPlayers = row.insertCell(2);
				var roomJoin = row.insertCell(3);

				roomName.innerHTML = rooms[i].name;

				if(rooms[i].password != 0) {
					roomPass.innerHTML = "Áno";
				} 
				else{
					roomPass.innerHTML = "Nie";
				}

				roomPlayers.innerHTML = rooms[i].players.length + "/2";

				roomJoin.innerHTML = "<div class='jc_room_button' id='"+ rooms[i].id +"' onclick='action(\"join\",this);'> Pripojiť </div>";

			}


		});

	}

	showForm() {
		document.getElementById('create_room_form').style.display = "block";
		document.getElementById('list_room_tab').style.display = "none";
		document.getElementById('controls').style.display = "none";
	}

	showControls() {
		document.getElementById('controls').style.display = "block";
		document.getElementById('create_room_form').style.display = "none";
		document.getElementById('list_room_tab').style.display = "none";
	}

	show_message(message,reload) {

		document.getElementById('message_box').style.display = "block";
		document.getElementById('message').innerHTML = message;

		let button = document.createElement('button');
		button.innerHTML = "OK";
		
		if(reload) {

			button.onclick = function() {
				location.reload();
			};

		}
		else {

			button.onclick = function() {
				this.hide_message();
			}.bind(this);

		}

		let mbutton = document.getElementById('message_button');
		mbutton.innerHTML = "";
		mbutton.appendChild(button);
	
	}

	hide_message() {
		document.getElementById('message').innerHTML = "";
		document.getElementById('message_button').innerHTML = "";
		document.getElementById('message_box').style.display = "none";
	}

	createPasswordBox(roomid) {

		let passbox = document.getElementById('password_box');
		passbox.innerHTML = "";

		let passbox_form = document.createElement('div');
		passbox_form.id = "passbox_form";
		passbox_form.innerHTML = "<label for='password_join'>Zadaj heslo:</label> <br />	<input type='text' id='password_join' name='password_join'>";
		passbox.appendChild(passbox_form);

		let passbox_button = document.createElement('div');
		passbox_button.id = "passbox_button";
		passbox.appendChild(passbox_button);

		let button = document.createElement('button');
		button.innerHTML = "Pripojiť";
		button.onclick = function() {
			let password = document.getElementById('password_join').value;
			game.menu.sendPassword(roomid,password);
		}
		passbox_button.appendChild(button);

	}

	show_passwordBox () {
		document.getElementById('password_box').style.display = "block";
	}

	hide_passwordBox() {
		document.getElementById('password_box').style.display = "none";
		document.getElementById('password_box').innerHTML = "";
	}

}