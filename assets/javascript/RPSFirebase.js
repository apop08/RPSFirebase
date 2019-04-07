
/**************************************************************************************************/
/*!
* file	TriviaGame.js
* date	3/21/2019
* authors: Alex Poplawski
* brief
The javascript file for the trivia handles all the game logic and drawing for trivia game
*/
/**************************************************************************************************/
var config = {
    apiKey: "AIzaSyBFyFpGWds-5pTlq_qlE5wyuDenndxVu9Q",
    authDomain: "rpsfirebase-4ed4f.firebaseapp.com",
    databaseURL: "https://rpsfirebase-4ed4f.firebaseio.com",
    projectId: "rpsfirebase-4ed4f",
    storageBucket: "rpsfirebase-4ed4f.appspot.com",
    messagingSenderId: "1057815434004"
};
firebase.initializeApp(config);
database = firebase.database();
// JavaScript function that wraps everything
$(document).ready(function () {
    /*
        the game object singleton
    */
    var gameInfo = {
        playerMe: "",
        nextpid: 99999,
        isCreated: false,
        lastPlay: null,
        playRound: function () {
            p1throw = p1.throw();
            p2throw = p2.throw();
            if ((p1throw == "r" && p2throw == "s") ||
                (p1throw == "p" && p2throw == "r") ||
                (p1throw == "s" && p2throw == "p")) {
                p1.incWin();
                p2.incLoss();
            }
            else if ((p1throw == "s" && p2throw == "r") ||
                (p1throw == "r" && p2throw == "p") ||
                (p1throw == "p" && p2throw == "s")) {
                p1.incLoss();
                p2.incWin();
            }
        },

        setID: function (snapshot) {
            var playerRef = null;
            if(!snapshot.child("player1").exists())
            {
                playerRef = database.ref("/player1");
                this.playerMe = "player1";
            } 
            else if(!snapshot.child("player2").exists()){
                playerRef = database.ref("/player2");
                this.playerMe = "player2";
            }
            else{
                playerRef = database.ref("/spec");
                this.playerMe = "spec";
            }

            var thisPlayer = playerRef.push({

                pid: this.nextpid,
                wins: 0,
                losses: 0,
            });
            this.nextpid += 1;


            
            database.ref("/nextpid").update({
                nextpid: this.nextpid
            });
            // Remove user from the connection list when they disconnect.
            thisPlayer.onDisconnect().remove();

            
        },

        sendPlay: function (toss) {
            var playerRef = null;
            if(this.playerMe == "player1")
            {
                playerRef = database.ref("/player1throw");
            } 
            else if(this.playerMe == "player2"){
                playerRef = database.ref("/player2throw");
            }

            var thisPlayer = playerRef.set({

                toss: toss
            });
            lastPlay = thisPlayer;

        }
    }


    database.ref().once("value", function (snapshot) {
        console.log(snapshot.val().nextpid.nextpid);
        gameInfo.nextpid = parseInt(snapshot.val().nextpid.nextpid);
        if(gameInfo.isCreated == false)
        {
            gameInfo.setID(snapshot);
            isCreated = true;
        }
        gameInfo.sendPlay("r");
    });

    

});