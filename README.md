# TAOverlay
*(This readme is messy, and written at 4:30 AM, so get ready... This will eventually be updated and look pretty.)*  
If you're worried about it being hacky, I advise you to look away *right now*.

A scoreoverlay made to connect to TournamentAssistant through a relay server.  

- More info can be read in `Backend/main.js`

Demo: https://www.youtube.com/watch?v=6KrD1ETgz1A

The backend was updated by by [Moon](https://github.com/MatrikMoon), to handle the new TournamentAssistant Protobuf changes, through [Dannypokes'](https://github.com/Dannypoke03) [TournamentAssistantClient](https://github.com/Dannypoke03/TournamentAssistantClient).

# What's in the repo?
The repo contains 2 files to worry about: `Backend/main.js` and `Frontend/index.html`  

- `Backend/main.js` contains the code to the relay server, and handles the actual TournamentAssistant-server connection.
- `Frontend/index.html` contains the frontend code to generate the overlay, and should be hosted on a webserver.

Index.html can be previewed by using the variables `?dm&pc=2`. (`dm` to activate dummymode, and `pc` to control the playercount).  
It's mostly used to make sure that style changes didn't mess it up.

Demo: [Here](http://danesaber.cc/TA/taoverlay1v1.html?dm&pc=2) - Put this into a OBS browser source with 1920x1080/2560x1440 dimensions.
## Deployment
Before you deploy the relay server, there's a few things to change:

- Replace the TA IP on line `52` in `Backend/main.js`, change the relay server IP on line `58`. Remember this IP.

Head into `Webserver/index.html`.
Change the following:
- Replace `https://i.imgur.com/3KgARpG.png` on lines `156`, `303` and `304` in `index.html` with your own placeholder image for Oculus/Default Steam PFP's.
- Replace the IP on line `329` with the relay server IP. (The one with port 2223).

Start out by opening your terminal of choice, and navigate to the directory where `main.js` is located.

Proceed to run:
```bash
  npm install
```
and then
```bash
  node main
```

If all goes well, you should see "Connected to relay server".

- `index.html` can be deployed on GitHub-pages or your own webserver. 

Add a browser source to OBS, with 1920x1080 dimensions, linking to **http**://IP_OR_URL/index.html  
(Do **not** use HTTPS, as it **will** refuse the connecting to a non-secured WebSocket Server.)


## Contributing

Admittedly, my JS is **not** top-notch, so if you see anything that could be done in a better way, feel free to make a pull request.

I'll most likely create an overlay where you can input ScoreSaber ID's so you can control Player1 and Player2 order in the overlay. 
 
If anything is missing, just open an Issue and I'll look at it.
