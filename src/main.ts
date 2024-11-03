import { app, BrowserWindow, ipcMain,Tray } from 'electron';
import * as path from 'path';
import {SerialPort} from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';



let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,    // Largura mínima
    minHeight: 400,   // Altura mínima
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
  const port = new SerialPort({
    path: 'COM3',  // Substitua pela porta correta
    baudRate: 9600 // Defina a taxa de transmissão correta
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  // Enviar dados recebidos da porta serial para o frontend
  parser.on('data', (data: string) => {
    if (mainWindow) {
      mainWindow.webContents.send('serial-data', data);
    }
  });

  // Receber dados do frontend e enviá-los pela porta serial
  ipcMain.on('send-to-serial', (_event, message: string) => {
    port.write(message, (err) => {
      if (err) {
        return console.error('Erro:', err.message);
      }
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
