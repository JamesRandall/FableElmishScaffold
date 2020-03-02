import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as handlebars from 'handlebars'
import { locateFsproject, getRootFolder, getTemplateRootPath, addToFsProj, ISettings, getSettings } from './common'

interface ITemplates {
  app: HandlebarsTemplateDelegate<any>
  appTypes: HandlebarsTemplateDelegate<any>
  appState: HandlebarsTemplateDelegate<any>
  router: HandlebarsTemplateDelegate<any>
}

interface ITemplateProperties {
  settings: ISettings
}

const loadTemplates = (context: vscode.ExtensionContext) : ITemplates => {
  let templatesRootPath = getTemplateRootPath(context);
  
  const appPath = path.join(templatesRootPath, `app.hbr`);
  const appStatePath = path.join(templatesRootPath, `appState.hbr`);
  const appTypesPath = path.join(templatesRootPath, `appTypes.hbr`);
  const routerPath = path.join(templatesRootPath, `router.hbr`);

  return {
    app: handlebars.compile(fs.readFileSync(appPath).toString()),
    appTypes: handlebars.compile(fs.readFileSync(appTypesPath).toString()),
    appState: handlebars.compile(fs.readFileSync(appStatePath).toString()),
    router: handlebars.compile(fs.readFileSync(routerPath).toString())
  }
}

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

  const templates = loadTemplates(context);
  const properties = {
    settings: getSettings()
  }

  const app = templates.app(properties);
  const appTypes = templates.appTypes(properties);
  const appState = templates.appState(properties);
  const router = templates.router(properties);

  /*const templateRootPath = getTemplateRootPath(context);
  const router = fs.readFileSync(path.join(templateRootPath, "Router.fs")).toString();
  const routerPath = path.join(destFolder, "Router.fs");
  const app = fs.readFileSync(path.join(templateRootPath, "App.fs")).toString();
  const appPath = path.join(destFolder, "App.fs");
  const appState = fs.readFileSync(path.join(templateRootPath, "AppState.fs")).toString();
  const appStatePath = path.join(destFolder, "AppState.fs");
  const appTypes = fs.readFileSync(path.join(templateRootPath, "AppTypes.fs")).toString();
  const appTypesPath = path.join(destFolder, "AppTypes.fs");*/

  const routerPath = path.join(destFolder, "Router.fs");
  const appPath = path.join(destFolder, "App.fs");
  const appStatePath = path.join(destFolder, "AppState.fs");
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
