
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

var playersRef = database.ref("/players");
var chatRef = db.ref("/chat");
var connectedRef = database.ref(".info/connected");
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
        p1 = {
            name: "",
            wins: 0,
            losses: 0,
            pick: "",
        },
        p2 = {
            name: "",
            wins: 0,
            losses: 0,
            pick: "",
        }
    }



});