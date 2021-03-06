import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as helpers from './common';

export const command = async (context: vscode.ExtensionContext) => {
  const destPath = path.join(helpers.getRootFolder(), ".fable-elmish-templates");
  if (fs.existsSync(destPath))
  {
    const result = helpers.showYesNo("Overwrite existing ejected templates?");
    if (!result) return;
  }
  else
  {
    fs.mkdirSync(destPath);
  }
  
  const templatesRootPath = path.join(context.extensionPath, 'templates');
  const files = fs.readdirSync(templatesRootPath).filter(f => f.toLowerCase().endsWith(".hbr"));
  files.forEach(f => fs.copyFileSync(path.join(templatesRootPath, f), path.join(destPath, f)));
};