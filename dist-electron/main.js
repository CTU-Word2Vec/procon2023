'use strict';
const n = require('electron');
n.app.whenReady().then(() => {
	const e = new n.BrowserWindow({ title: 'Procon 2023 - Castle game' });
	process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile('dist/index.html');
});
