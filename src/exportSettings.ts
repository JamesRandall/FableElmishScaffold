import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as helpers from './common';

export const command = async (context: vscode.ExtensionContext) => {
  let settingsPath = path.join(helpers.getRootFolder(), helpers.settingsFilename);

  fs.writeFileSync(settingsPath, JSON.stringify(helpers.defaultSettings()));
  vscode.window.showInformationMessage(`Settings exported to ${settingsPath}`);
};