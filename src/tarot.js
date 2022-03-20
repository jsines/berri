const fs = require('fs');

const EntityList = [];

function createEntity(id) {
    EntityList.append(id);
}

module.exports = {
    createEntity,
    destroyEntity,
    initialize,    
};