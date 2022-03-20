const tarot = require('../tarot');

test('Created players can be assigned names', () => {
    expect(tarot.createPlayer('John')).toEqual({ name: 'John', deck: [] });
});