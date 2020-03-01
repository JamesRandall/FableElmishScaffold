import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { locateFsproject, getRootFolder, getTemplateRootPath, addToFsProj } from './common'

const writeAndOpenAsset= async (path:string, content:string) => {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, "");
  }

  const doc = await vscode.workspace.openTextDocument(path);
  const textEditor = await vscode.window.showTextDocument(doc);
  await textEditor.edit(builder => {
    const begin = new vscode.Position(0, 0);
    const end = new vscode.Position(doc.lineCount-1, doc.lineAt(doc.lineCount-1).text.length);
    builder.replace(new vscode.Selection(begin, end), content);
  });
  await doc.save();
}

export const command = async (context: vscode.ExtensionContext) => {
  const rootFolder = getRootFolder();
  const fsProj = locateFsproject(rootFolder);

  if (!fsProj) return;

  const destFolder = path.dirname(fsProj);

  const templateRootPath = getTemplateRootPath(context);
  const router = fs.readFileSync(path.join(templateRootPath, "Router.fs")).toString();
  const routerPath = path.join(destFolder, "Router.fs");
  const app = fs.readFileSync(path.join(templateRootPath, "App.fs")).toString();
  const appPath = path.join(destFolder, "App.fs");
  const appState = fs.readFileSync(path.join(templateRootPath, "AppState.fs")).toString();
  const appStatePath = path.join(destFolder, "AppState.fs");
  const appTypes = fs.readFileSync(path.join(templateRootPath, "AppTypes.fs")).toString();
  const appTypesPath = path.join(destFolder, "AppTypes.fs");

  await writeAndOpenAsset(routerPath, router);
  await writeAndOpenAsset(appTypesPath, appTypes);
  await writeAndOpenAsset(appStatePath, appState);
  await writeAndOpenAsset(appPath, app);
  
  await addToFsProj(fsProj, [
    // order is important here
    path.relative(path.dirname(fsProj), routerPath),
    path.relative(path.dirname(fsProj), appTypesPath),
    path.relative(path.dirname(fsProj), appStatePath),
    path.relative(path.dirname(fsProj), appPath)
  ]);

  vscode.window.showInformationMessage("Now add the NuGet package Fable.Elmish.Browser");
}
