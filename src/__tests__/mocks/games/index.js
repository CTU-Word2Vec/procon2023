import fs from 'fs';

const originalField = JSON.parse(fs.readFileSync('./1.json', 'utf-8'));

let fileContent = '0 100 5';

const ponds = originalField.ponds;
fileContent += '\n';
fileContent += ponds.length + '\n';
fileContent += ponds.map((pond) => `${pond.x} ${pond.y}`).join('\n');

const castles = originalField.castles;
fileContent += '\n';
fileContent += castles.length + '\n';
fileContent += castles.map((pond) => `${pond.x} ${pond.y}`).join('\n');

const allyAgents = originalField.craftsmen.filter((craftsman) => craftsman.side === 'A');
fileContent += '\n';
fileContent += allyAgents.length + '\n';
fileContent += allyAgents.map((pond) => `${pond.x} ${pond.y}`).join('\n');

const enemyAgents = originalField.craftsmen.filter((craftsman) => craftsman.side === 'B');
fileContent += '\n';
fileContent += enemyAgents.length + '\n';
fileContent += enemyAgents.map((pond) => `${pond.x} ${pond.y}`).join('\n');

fs.writeFileSync('./1.txt', fileContent, 'utf-8');
