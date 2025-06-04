import osUtils from 'os-utils';
import os from 'os';
import fs from 'fs';
import { BrowserWindow } from 'electron';
import { ipcWebContentsSend } from './util.js';
const POLLING_INTERVAL = 500;

export function poll(mainWindow: BrowserWindow) {
    setInterval(async () => {
        const cpuUsage = await getCpu();
        const ramUsage = await getRam();
        const storageData = await getStorage();
        const ramInUse = await getRamUse();
        ipcWebContentsSend('statistics', mainWindow.webContents, {
            cpuUsage,
            ramUsage,
            storageData: storageData.usage,
            ramInUse,
        });
    }, POLLING_INTERVAL)
}

export function getStaticData() {
    const totalStorage = getStorage().total
    const cpuModel = os.cpus()[0].model;
    const hostName = os.userInfo().username;
    const totalMem = Math.round(osUtils.totalmem() / 1024)
    return {
        totalStorage,
        cpuModel,
        hostName,
        totalMem
    }
}

function getCpu(): Promise<number> {
    return new Promise((resolve) => {
        osUtils.cpuUsage(resolve)
    })
}

function getRam() {
    return 1 - osUtils.freememPercentage();
}

function getRamUse() {
    return Math.floor( (os.totalmem() - os.freemem()) / 1_000_000_000) ;
}

function getStorage() {
    const stats = fs.statfsSync(process.platform === 'win32' ? 'C://' : '/');
    const total = stats.bsize * stats.blocks;
    const free = stats.bsize * stats.bfree;

    return {
        total: Math.floor(total / 1_000_000_000),
        usage: 1 - free / total,
    }
}