"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600, // Largura mínima
        minHeight: 400, // Altura mínima
        icon: "./assets/icon.ico",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    // Comunicação serial
    const port = new serialport_1.SerialPort({
        path: 'COM3', // Substitua pela porta correta
        baudRate: 9600 // Defina a taxa de transmissão correta
    });
    const parser = port.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\r\n' }));
    // Enviar dados recebidos da porta serial para o frontend
    parser.on('data', (data) => {
        if (mainWindow) {
            mainWindow.webContents.send('serial-data', data);
        }
    });
    // Receber dados do frontend e enviá-los pela porta serial
    electron_1.ipcMain.on('send-to-serial', (_event, message) => {
        port.write(message, (err) => {
            if (err) {
                return console.error('Erro:', err.message);
            }
        });
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
