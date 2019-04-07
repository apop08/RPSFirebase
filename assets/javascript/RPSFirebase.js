
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
        curThrow: "",
        p1id: 0,
        p2id: 0,
        p1wins: 0,
        p1losses: 0,
        p2wins: 0,
        p2losses: 0,
        playRound: function (p1throw, p2throw) {


            if ((p1throw == "r" && p2throw == "s") ||
                (p1throw == "p" && p2throw == "r") ||
                (p1throw == "s" && p2throw == "p")) {
                ++this.p1wins;
                ++this.p2losses;
            }
            else if ((p1throw == "s" && p2throw == "r") ||
                (p1throw == "r" && p2throw == "p") ||
                (p1throw == "p" && p2throw == "s")) {
                ++this.p2wins;
                ++this.p1losses;
            }
            if (this.playerMe == "player1") {
                database.ref("/player1").remove();
                var thisPlayer = database.ref("/player1").push({

                    pid: this.p1id,
                    wins: this.p1wins,
                    losses: this.p1losses,
                });

                // Remove user from the connection list when they disconnect.
                thisPlayer.onDisconnect().remove();
            }

            if (this.playerMe == "player2") {
                database.ref("/player2").remove();
                var thisPlayer = database.ref("/player2").push({

                    pid: this.p2id,
                    wins: this.p2wins,
                    losses: this.p2losses,
                });

                // Remove user from the connection list when they disconnect.
                thisPlayer.onDisconnect().remove();
            }
        },

        setID: function (snapshot) {
            var playerRef = null;
            if (!snapshot.child("player1").exists()) {
                playerRef = database.ref("/player1");
                this.playerMe = "player1";
            }
            else if (!snapshot.child("player2").exists()) {
                playerRef = database.ref("/player2");
                this.playerMe = "player2";
            }
            else {
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
            if (this.playerMe == "player1") {
                playerRef = database.ref("/player1throw");
            }
            else if (this.playerMe == "player2") {
                playerRef = database.ref("/player2throw");
            }

            var thisPlayer = playerRef.set({

                toss: toss
            });
            this.lastPlay = thisPlayer;
            this.curThrow = toss;

        }
    }


    database.ref().once("value", function (snapshot) {
        gameInfo.nextpid = parseInt(snapshot.val().nextpid.nextpid);
        if (gameInfo.isCreated == false) {
            gameInfo.setID(snapshot);
            isCreated = true;
        }
        gameInfo.sendPlay("r");
    }).then(function () {
        database.ref("/player1throw").on("value", function (snapshot2) {
            if (gameInfo.lastPlay && gameInfo.playerMe == "player2" && snapshot2.val()) {
                console.log(snapshot2.val());

                gameInfo.playRound(snapshot2.val().toss, gameInfo.curThrow);

                gameInfo.curThrow = "";
                gameInfo.lastPlay = null;
                database.ref("/player1throw").remove();
                database.ref("/player2throw").remove();
            }
        });
    }).then(function () {
        database.ref("/player2throw").on("value", function (snapshot2) {
            if (gameInfo.lastPlay && gameInfo.playerMe == "player1" && snapshot2.val()) {
                console.log(snapshot2.val());

                gameInfo.playRound(gameInfo.curThrow, snapshot2.val().toss);

                gameInfo.curThrow = "";
                gameInfo.lastPlay = null;
                database.ref("/player1throw").remove();
                database.ref("/player2throw").remove();
            }
        });
    });

    database.ref("/player1").on("value", function (snapshot) {
        snapshot.forEach(function (s2) {
            if (s2.val()) {
                console.log(s2.val());
                gameInfo.p1wins = s2.val().wins;
                gameInfo.p1losses = s2.val().losses;
                gameInfo.p1id = s2.val().pid;
            }
        })

    });

    database.ref("/player2").on("value", function (snapshot) {
        snapshot.forEach(function (s2) {
            if (s2.val()) {
                console.log(s2.val());
                gameInfo.p2wins = s2.val().wins;
                gameInfo.p2losses = s2.val().losses;
                gameInfo.p2id = s2.val().pid;
            }
        })

    });

});