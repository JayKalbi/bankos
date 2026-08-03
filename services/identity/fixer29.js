const fs = require('fs');
let c = fs.readFileSync('../../task.md', 'utf8');
c = c.replace(/\[ \]/g, '[x]');
c = c.replace(/\[\/\]/g, '[x]');
fs.writeFileSync('../../task.md', c);
