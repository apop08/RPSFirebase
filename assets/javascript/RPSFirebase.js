/**************************************************************************************************/
/*!
* file	rpsfirebase.js
* date	3/21/2019
* authors: Alex Poplawski
* brief
The javascript file for the trivia handles all the game logic and drawing for rps game
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

var playersRef = database.ref("/players");
var chatRef = database.ref("/chat");
var connectedRef = database.ref(".info/connected");
var resetId = null;
// JavaScript function that wraps everything
$(document).ready(function () {
    /*
        the game object singleton
    */
    var gameInfo = {
        playerName: "",
        p1LoggedIn: false,
        p2LoggedIn: false,
        pNum: null,
        pObj: null,
        p1: {
            name: "",
            wins: 0,
            losses: 0,
            pick: "",
        },
        p2: {
            name: "",
            wins: 0,
            losses: 0,
            pick: "",
        }
    }

    //chat module
    let chat = {
        //adds the event listeners for the chat from firebase
        addListeners: function () {

            chatRef.on("child_added", function (snapshot) {
                let chatObj = snapshot.val();
                let chatText = chatObj.text;
                let chatLogItem = $("<li>").attr("id", snapshot.key);
                //add the name of the person to the chat
                if (chatObj.name) {
                    chatText = "<strong>" + chatObj.name + ":</strong> " + chatText;
                }

                chatLogItem.html(chatText);
                //append it to the dom
                $("#chat-log").append(chatLogItem);

                // scroll to the bottom 
                $("#chat-log").scrollTop($("#chat-log")[0].scrollHeight);
            });
            //add the send chat button logic
            $("#sendChat").click(function (event) {
                event.preventDefault();
                //add the chat object to the firebase
                chatRef.push({
                    name: gameInfo.playerName,
                    text: $("#chat").val().trim()
                });
                //clear the chat box
                $("#chat").val("");
            });
        }
    }

    let game = {

        rps: function(p1choice, p2choice) {
            //display the selections to the dom
            $(".p1-selection-reveal").text(p1choice);
            $(".p2-selection-reveal").text(p2choice);
    
            showSelections();
            if(p1choice == p2choice)
            {
                $("#feedback").html("Tie");
            }
            else if ((p1choice == "rock" && p2choice == "scissors") || 
                    (p1choice == "paper" && p2choice == "rock") || 
                    (p1choice == "scissors" && p2choice == "paper")) {
                // p1 wins
                $("#feedback").html(p1choice + " beats " + p2choice + "<br/>" + gameInfo.p1.name + " wins!");
                //only perform if your the winner/loser
                if (gameInfo.pNum == "1") {
                    gameInfo.pObj.wins++;
                }
                else {
                    gameInfo.pObj.losses++;
                }
            } 
            else {
                // p2 wins
                $("#feedback").html(p2choice + " beats " + p1choice + "<br/>" + gameInfo.p2.name + " wins!");
                //only perform if your the winner/loser
                if (gameInfo.pNum == "2") {
                    gameInfo.pObj.wins++;
                } 
                else {
                    gameInfo.pObj.losses++;
                }
            }
            //reset after 3 seconds
            resetId = setTimeout(game.reset, 3000);
        },

        //reset the function called from outside object
        reset: function() {
            clearTimeout(resetId);
            // clear the pick
            gameInfo.pObj.pick = "";
            //set the firebase object
            database.ref("/players/" + gameInfo.pNum).set(gameInfo.pObj);
    
            $(".selection-reveal").hide();
            $("#feedback").empty();
        },
        //update the game stats
        updateStats: function () {
            $("#p1-wins").text(gameInfo.p1.wins);
            $("#p1-losses").text(gameInfo.p1.losses);
            $("#p2-wins").text(gameInfo.p2.wins);
            $("#p2-losses").text(gameInfo.p2.losses);
    
            gameInfo.p1LoggedIn ? $(".p1-stats").show() : $(".p1-stats").hide();
            gameInfo.p2LoggedIn ? $(".p2-stats").show() : $(".p2-stats").hide();
        },
        //update the player box
        updatePlayerBox: function(playerNum, exists, choice) {
            if (exists) {
                if (gameInfo.pNum != playerNum) {
                    if (choice) {
                        $(".p" + playerNum + "-selection-made").show();
                    } else {
                        $(".p" + playerNum + "-selection-made").hide();
                    }
                }
            } else {
                $(".p" + playerNum + "-selection-made").hide();
            }
        },

        addListeners: function () {
            playersRef.on("child_added", function (snapshot) {
                if (snapshot.key == 1) {
                    gameInfo.p1LoggedIn = true;
                    gameInfo.p1 = snapshot.val();
                }
                else {
                    gameInfo.p2LoggedIn = true;
                    gameInfo.p2 = snapshot.val();
                }
            });

            playersRef.on("child_changed", function (snapshot) {
                if (snapshot.key == 1) {
                    gameInfo.p1 = snapshot.val();
                }
                else {
                    gameInfo.p2 = snapshot.val();
                }

                game.updateStats();
            });

            // when player is removed, reset respective playerObject and loggedIn flag
            playersRef.on("child_removed", function (snapshot) {
                if (snapshot.key == 1) {
                    gameInfo.p1LoggedIn = false;
                    gameInfo.p1 = {
                        name: "",
                        wins: 0,
                        losses: 0,
                        pick: "",
                    }
                }
                else {
                    gameInfo.p2LoggedIn = false;
                    gameInfo.p2 = {
                        name: "",
                        wins: 0,
                        losses: 0,
                        pick: "",
                    }
                }

            });

            // when general changes are made, perform bulk of game logic
            playersRef.on("value", function (snapshot) {
                // update the player names
                let text = "Waiting for Player 1";
                if (gameInfo.p1.name) {
                    text = gameInfo.p1.name;
                }
                $("#player-1").text(text);

                text = "Waiting for Player 2";
                if (gameInfo.p2.name) {
                    text = gameInfo.p2.name;
                }
                $("#player-2").text(text);

                // update which part of the player box is showing based on whether a selection has been made
                game.updatePlayerBox("1", snapshot.child("1").exists(), snapshot.child("1").exists() && snapshot.child("1").val().pick);
                game.updatePlayerBox("2", snapshot.child("2").exists(), snapshot.child("2").exists() && snapshot.child("2").val().pick);

                // display correct "screen" depending on logged in statuses
                if (gameInfo.pNum) {
                    drawRest();
                } else {
                    showLoginScreen();
                }

                // if both players have selected their choice, perform the comparison
                if (gameInfo.p1.pick && gameInfo.p2.pick) {
                    game.rps(gameInfo.p1.pick, gameInfo.p2.pick);
                }

            });

            $("#login").click(function (event) {
                event.preventDefault();

                // check to see which player slot is available
                if (!gameInfo.p1LoggedIn) {
                    gameInfo.pNum = "1";
                    gameInfo.pObj = gameInfo.p1;
                }
                else if (!gameInfo.p2LoggedIn) {
                    gameInfo.pNum = "2";
                    gameInfo.pObj = gameInfo.p2;
                }
                else {
                    gameInfo.pNum = null;
                    gameInfo.pObj = null;
                }

                if (gameInfo.pNum) {
                    gameInfo.playerName = $("#nameinput").val().trim();
                    gameInfo.pObj.name = gameInfo.playerName;
                    $("#nameinput").val("");

                    database.ref("/players/" + gameInfo.pNum).set(gameInfo.pObj);
                    database.ref("/players/" + gameInfo.pNum).onDisconnect().remove();
                }
            });

            $(".selection").click(function () {
                if (!gameInfo.pNum) return;

                gameInfo.pObj.pick = this.id;
                database.ref("/players/" + gameInfo.pNum).set(gameInfo.pObj);

                $(".p" + gameInfo.pNum + "-selections").hide();
                $(".p" + gameInfo.pNum + "-selection-reveal").text(this.id).show();
            });

            
        }
    }


    connectedRef.on("value", function (snapshot) {
        if (!snapshot.val() && gameInfo.pNum) {
            database.ref("/players/" + gameInfo.pNum).remove();
            playerNumber = null;

            game.showLoginScreen();
        }
    });

    function showLoginScreen() {
        $(".post-login, .selections").hide();
        $(".pre-login").show();
    }

    function drawRest() {
        $(".pre-login").hide();
        $(".post-login").show();
        if (gameInfo.pNum == "1") {
            $(".p1-selections").show();
        } else {
            $(".p1-selections").hide();
        }
        if (gameInfo.pNum == "2") {
            $(".p2-selections").show();
        } else {
            $(".p2-selections").hide();
        }
    }

    function showSelections() {
        $(".selections, .selection-made").hide();
        $(".selection-reveal").show();
    }
    game.addListeners();
    chat.addListeners();
});