'use strict';

const AIMLInterpreter = require('aimlinterpreter');
let aimlInterpreter = new AIMLInterpreter({

});
aimlInterpreter.loadAIMLFilesIntoArray([__dirname + '/citibike.aiml.xml']);

var callback = function (answer, wildCardArray, input) {
    console.log(answer + ' | ' + wildCardArray + ' | ' + input);
};

//aimlInterpreter.findAnswerInLoadedAIMLFiles('TEST MULTIPLE AA WILDCARDS bbbbb56 sdfasdf', callback);
//aimlInterpreter.findAnswerInLoadedAIMLFiles('SHOW ME BIKES NEAR 35 RIVER DRIVE ', callback);
//aimlInterpreter.findAnswerInLoadedAIMLFiles('SAVE MY home1 ADDRESS : asdfas jer ', callback);
//aimlInterpreter.findAnswerInLoadedAIMLFiles('SHOW ME BIKES NEAR HOME', callback);
// aimlInterpreter.findAnswerInLoadedAIMLFiles('SHOW ME BIKES NEAR HOME', function (answer, wildCardArray) {
//     console.log(answer + ' | ' + wildCardArray + ' | ');
//     //there is no home address for this user 
//     aimlInterpreter.findAnswerInLoadedAIMLFiles('FORMAT : PLEASE PROVIDE YOUR HOME ADDRESS', callback);
// });
//aimlInterpreter.findAnswerInLoadedAIMLFiles('WHAT IS YOUR NAME', callback);
module.exports = aimlInterpreter;