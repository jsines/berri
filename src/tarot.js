const fs = require('fs');
function createPlayer(playerName){
    return {
        name: playerName,
        deck: null
    }
}

function loadDeck(deckString){
    return JSON.parse(fs.readFileSync(deckString, 'utf8'));
}
loadDeck('./deck1.json');
module.exports = {
    createPlayer
};