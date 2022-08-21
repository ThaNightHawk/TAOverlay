/*This is temprorary, and a VERY VERY VERY VERY VERY VERY VERY VERY VERY (You get the point) >BAD< way to do this, but it works... So PLEASE adapt this to work on your own setup.

This was updated by the help of Moon, thank you<3.

This is hacky solution to connect to the frontend, without having to rewrite a lot.

Remember to run NPM install on this, before doing "node main".

A simple explanation of this.

1) You create the relay-server on port 2223
2) You connect to the TA server.
3) You connect to the relay server, which your frontend also connects to. 

Type of messages: 

Type 1 = {"Type":"1","userid":"numerical_id","order":0}
- This message is sent for every user added to the match, until there's no more users found in that list.
- The frontend handles showing the actual users playing, and not the overlay or the coordinator.

Type 2 = {"Type":"2"}
- This message tells that the match has been deleted, the script is free to create a new match.

Type 3 = {"Type":"3","LevelId":"custom_level_FDA568FC27C20D21F8DC6F3709B49B5CC96723BE","Diff":2}
- This message is sent to change the lvl on the frontend in real time. - Sends the hash and diff. (Easy:0, Normal:1, Hard:2, Expert:3, ExpertPlus:4)

Type 4 = {'Type':'4','playerId':e.data.user_id,'score':e.data.score,'combo':e.data.combo,'acc':e.data.accuracy,'visible':true}
- This message sends the playerid, their score, their combo and their acc. Visible:true is gonna get removed later on, currently I'm just lazy
*/


const tournament_assistant_client_1 = require("tournament-assistant-client");
const WebSocket = require('ws');


//Here we create our websocket server to relay the info. - This is the server your frontend connects to. 
//There is absolutely no security in this, so don't expose the port if you're worried about abuse of it.
var port = 2223;
const wss = new WebSocket.Server({ "port": port });
wss.on('connection', function connection(ws) {
  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
		client.send(data, { binary: isBinary });
      }
    });
  });
});

//Here we connect to the TA websocket, by the help of Danny's TA client.
var taWebsocket = new tournament_assistant_client_1.TAWebsocket({
	url: "ws://tournamentassistant.net:2053",
	name: "TA Overlay",
});

//Connect to the relay server we created above. - Make sure your frontend is connecting to THIS ip.
var ws = new WebSocket("ws://ta.danesaber.cc:2223");
sockets = ws;
//If the connection is opened successfully, we tell the user that.
ws.onopen = function(event) {
	console.log("Connected to Relay server");
};

//Here we clarify, that we're NOT in a match right now.
let InMatch = false;
//This is the matchData array. This is used to store the user ID
//matchData[0] and [1] is used to verify, that we're only using the data we actually need, and only updates when we recieve data that contains the stored IDs
let matchData = [];

//This is triggered when a match is created.
taWebsocket.taClient.on('matchCreated', async (e) => {
	//If the backend is not locked into a current match, we continue.
	if (!InMatch) {
		//Add this client as an associated user
		e.data.associated_users.push(taWebsocket.taClient.Self);
		taWebsocket.sendEvent(new tournament_assistant_client_1.Packets.Event({
		match_updated_event: new tournament_assistant_client_1.Packets.Event.MatchUpdatedEvent({ match: e.data })
		}));

		//Here we loop through every user until we hit the end.
		for (var i = 0; i < e.data.associated_users.length; i++) {
		
			//Here we check if the userids found are above 0 (This sorts out the coordinator).
			if (e.data.associated_users[i].user_id > 0) {
				//Here we push the userids to the matchData array.
				matchData.push(e.data.associated_users[i].user_id);
				//Here we send the json-string to the relay-server. This contains: Userid(Scoresaber ID), order(In what order they got added to the match-room, this dictates the order of which the overlay shows the users).
				sockets.send(JSON.stringify({'Type': '1','userid': e.data.associated_users[i].user_id,'order': i}));
				//Here we log to the console-window, so we can check if the correct ScoreSaber IDs are in the array.
				console.log(matchData[i]);
			}
		}
		//This tells the server that we're in a match, and for now shouldn't associate the overlay with other matches.
		InMatch = true;

		console.log("Match created, backend locked.");
	}
});

//This is triggered when a match is deleted.
taWebsocket.taClient.on('matchDeleted', async (e) => {	
		//Here we check if the user_id associated with the data recieved, is in matchData[>0<,0], and if it is, we continue.
		if (matchData[0] == e.data.associated_users[0].user_id) {
			//Here we send the message to the frontend through the relay server
			sockets.send(JSON.stringify({'Type': '2'}));
			//Here we unlock the backend.
			InMatch = false;
			//Here we reset the matchData-array for a new match.
			matchData.length = 0;
			console.log("Match deleted, backend unlocked.");
		}
});

//This is triggered when the match is updated. In this case, it's used if there's a change in the map.
taWebsocket.taClient.on('matchUpdated', (e) => {
	//Here we check if the user_id associated with the data recieved, is in matchData[>0<,0], and if it is, we continue.
	if (matchData[0] == e.data.associated_users[0].user_id) {
		//Because the code errors out when selecting a lvl, but not providing a diff, I'm using this in a try/catch, to log errors, but continue when there's no error.
		try {
		if (e.data.selected_difficulty >= 0) {
			//Here we send the json-string to the relay-server. This contains: Level Hash(custom_level_HASH), Diff(Easy:0, Normal:1, Hard:2, Expert:3, ExpertPlus:4).
			sockets.send(JSON.stringify({'Type': '3','LevelId': e.data.selected_level.level_id,'Diff': e.data.selected_difficulty}));
		}
		} catch(err) { 
			//I've yet to code actual error handling, but this would just show an error on level_id on match-creation, since no map is picked.

			// console.log(err); ?
		}
	}
});

taWebsocket.taClient.on('userUpdated', async (e) => {
	//Here we check if we're in a match, and the user_ids associated with the data recieved, is in matchData[>0<,0], and if it is, we continue.
	if (inMatch && matchData[0] == e.data.user_id || matchData[1] == e.data.user_id) {
		//Here we send the json-string to the relay-server. This contains: Player ID, Score, Combo and Acc.
		sockets.send(JSON.stringify({'Type': '4','playerId': e.data.user_id,'score': e.data.score,'combo': e.data.combo,'acc':e.data.accuracy,'visible':true}));
	}
});
