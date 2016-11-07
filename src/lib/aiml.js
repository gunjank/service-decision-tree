'use strict';

const AIMLInterpreter = require('aimlinterpreter');
let aimlInterpreter = new AIMLInterpreter({

});
aimlInterpreter.loadAIMLFilesIntoArray([__dirname + '/citibike.aiml.xml']);

// var callback = function (answer, wildCardArray, input) {
//     console.log(answer + ' | ' + wildCardArray + " | " + wildCardArray.length + ' | ' + input);
//     ///console.log(wildCardArray[0].trim() + "-  " + wildCardArray[0].trim().split(" ").length);
// };

//aimlInterpreter.findAnswerInLoadedAIMLFiles("ERROR MESSAGE", callback);
//aimlInterpreter.findAnswerInLoadedAIMLFiles('LATLONG LAT 40DOT746754625987 LONG 73DOT944012021375 ', callback);
//aimlInterpreter.findAnswerInLoadedAIMLFiles('show me bikes near home', callback);
//aimlInterpreter.findAnswerInLoadedAIMLFiles('video', callback);
// aimlInterpreter.findAnswerInLoadedAIMLFiles('SHOW ME BIKES NEAR HOME', function (answer, wildCardArray) {
//     console.log(answer + ' | ' + wildCardArray + ' | ');
//     //there is no home address for this user 
//     aimlInterpreter.findAnswerInLoadedAIMLFiles('FORMAT : PLEASE PROVIDE YOUR HOME ADDRESS', callback);
// });
//aimlInterpreter.findAnswerInLoadedAIMLFiles('WHAT IS YOUR NAME', callback);
module.exports = aimlInterpreter;