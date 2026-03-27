import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/focus:bg-white dark:bg-slate-800/g, 'focus:bg-white dark:focus:bg-slate-800');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed focus:bg-white');
