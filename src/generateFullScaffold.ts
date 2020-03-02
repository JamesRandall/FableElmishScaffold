import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { window } from 'vscode';
import * as handlebars from 'handlebars';

import { locateFsproject, getRootFolder, operations, showYesNo, getTemplateRootPath, addToFsProjAfterRouter } from './common';

interface IOperations {
  [key: string]: HandlebarsTemplateDelegate<any> | undefined

  types?: HandlebarsTemplateDelegate<any> | undefined
  api?: HandlebarsTemplateDelegate<any> | undefined
  state?: HandlebarsTemplateDelegate<any> | undefined
  view?: HandlebarsTemplateDelegate<any> | undefined
}

interface ITemplates {
  [key: string]: IOperations | HandlebarsTemplateDelegate<any>

  index: IOperations
  show: IOperations
  create: IOperations
  update: IOperations
  dispatcher: IOperations

  _appRender: HandlebarsTemplateDelegate<any>
  _appStateUpdate: HandlebarsTemplateDelegate<any>
  _appStateUrlUpdate: HandlebarsTemplateDelegate<any>
  _appTypesDispatcherModel: HandlebarsTemplateDelegate<any>
  _appTypesDispatcherModelInit: HandlebarsTemplateDelegate<any>
  _appTypesDispatcherMsg: HandlebarsTemplateDelegate<any>

  _routerPage: HandlebarsTemplateDelegate<any> 
  _routerSubPage: HandlebarsTemplateDelegate<any>
  _routerEntityPaths: HandlebarsTemplateDelegate<any>
  _routerEntityParser:  HandlebarsTemplateDelegate<any>
}

interface ITemplateProperties {
  rootNamespace: string
  operation: string
  camelEntityName: string
  entityName: string
  hasIndex: boolean
  hasShow: boolean
  hasUpdate: boolean
  hasCreate: boolean
}

const showInputBox = async () => {
  const result = await window.showInputBox({
    value: '',
    placeHolder: 'Enter entity name',
    validateInput: text => {
      return text.trim().length > 0 ? null : 'Required';
    }
  });
  return result;
}

const loadTemplates = (context: vscode.ExtensionContext): ITemplates => {
  let templatesRootPath = getTemplateRootPath(context);

  const routerPagePath = path.join(templatesRootPath, `_routerPage.hbr`);
  const routerSubPagePath = path.join(templatesRootPath, `_routerSubPage.hbr`);
  const routerEntityPathsPath = path.join(templatesRootPath, `_routerPaths.hbr`);
  const routerEntityParserPath = path.join(templatesRootPath, `_routerParser.hbr`);
  const appRenderPath = path.join(templatesRootPath, `_appRender.hbr`);
  const appStateUpdatePath = path.join(templatesRootPath, `_appStateUpdate.hbr`);
  const appStateUrlUpdatePath = path.join(templatesRootPath, `_appStateUrlUpdate.hbr`);
  const appTypesDispatcherMsgPath = path.join(templatesRootPath, `_appTypesDispatcherMsg.hbr`);
  const appTypesDispatcherModelPath = path.join(templatesRootPath, `_appTypesDispatcherModel.hbr`);
  const appTypesDispatcherModelInitPath = path.join(templatesRootPath, `_appTypesDispatcherModelInit.hbr`);

  const result: ITemplates = {
    index: {},
    show: {},
    create: {},
    update: {},
    dispatcher: {},

    _routerPage: handlebars.compile(fs.readFileSync(routerPagePath).toString()),
    _routerSubPage: handlebars.compile(fs.readFileSync(routerSubPagePath).toString()),
    _routerEntityPaths: handlebars.compile(fs.readFileSync(routerEntityPathsPath).toString()),
    _routerEntityParser: handlebars.compile(fs.readFileSync(routerEntityParserPath).toString()),

    _appRender: handlebars.compile(fs.readFileSync(appRenderPath).toString()),
    _appStateUpdate: handlebars.compile(fs.readFileSync(appStateUpdatePath).toString()),
    _appStateUrlUpdate: handlebars.compile(fs.readFileSync(appStateUrlUpdatePath).toString()),
    _appTypesDispatcherMsg: handlebars.compile(fs.readFileSync(appTypesDispatcherMsgPath).toString()),
    _appTypesDispatcherModel: handlebars.compile(fs.readFileSync(appTypesDispatcherModelPath).toString()),
    _appTypesDispatcherModelInit: handlebars.compile(fs.readFileSync(appTypesDispatcherModelInitPath).toString())
  }

  operations.forEach(operation => {
    const typesPath = path.join(templatesRootPath, `${operation}Types.hbr`);
    const apiPath = path.join(templatesRootPath, `${operation}Api.hbr`);
    const statePath = path.join(templatesRootPath, `${operation}State.hbr`);
    const viewPath = path.join(templatesRootPath, `${operation}View.hbr`);
    result[operation] = {
      types: handlebars.compile(fs.readFileSync(typesPath).toString()),
      api: fs.existsSync(apiPath) ? handlebars.compile(fs.readFileSync(apiPath).toString()) : undefined,
      state: handlebars.compile(fs.readFileSync(statePath).toString()),
      view: handlebars.compile(fs.readFileSync(viewPath).toString())
    }
  });
  return result;
}

const writeAndInsertAsset= async (path:string, marker: string, content:string) => {
  const doc = await vscode.workspace.openTextDocument(path);
  const textEditor = await vscode.window.showTextDocument(doc);
  let foundLineNumber = 0;

  for(let lineNumber=0; lineNumber < doc.lineCount; lineNumber++) {
    const line = doc.lineAt(lineNumber).text;
    if (line.toLowerCase().indexOf(marker) > -1) {
      foundLineNumber = lineNumber;
      break;
    }
  }

  await textEditor.edit(builder => {
    const begin = new vscode.Position(0, 0);
    const end = new vscode.Position(doc.lineCount-1, doc.lineAt(doc.lineCount-1).text.length);
    builder.insert(new vscode.Position(foundLineNumber+1, 0), content);
  });

  await doc.save();
}

const updateRouterIfExists = async (context: vscode.ExtensionContext, templates: ITemplates, entityName: string, activeOperations: string[]) => {
  const fsProj = locateFsproject(getRootFolder());
  if (!fsProj) {
    window.showWarningMessage('Could not locate the fsproj file, router will not be updated.');
    return;
  }
  const routerPath = path.join(path.dirname(fsProj), 'Router.fs');
  if (!fs.existsSync(routerPath)) {
    window.showWarningMessage('No router found. Try running "Scaffold Fable-Elmish Application Components" to generate components.')
    return;
  }
  
  const properties: ITemplateProperties = {
    rootNamespace: entityName,
    operation: "router",
    entityName: entityName,
    camelEntityName: entityName[0].toLowerCase() + entityName.substring(1),
    hasIndex: activeOperations.indexOf('index') > -1,
    hasShow: activeOperations.indexOf('show') > -1,
    hasUpdate: activeOperations.indexOf('update') > -1,
    hasCreate: activeOperations.indexOf('create') > -1
  };

  const subPage = templates._routerSubPage(properties);
  const page = templates._routerPage(properties);
  const parser = templates._routerEntityParser(properties);
  const paths = templates._routerEntityPaths(properties);

  await writeAndInsertAsset(routerPath, "begin entity pages - do not remove", subPage);
  await writeAndInsertAsset(routerPath, "begin root pages - do not remove", page);
  await writeAndInsertAsset(routerPath, "begin entity paths - do not remove", paths);
  await writeAndInsertAsset(routerPath, "begin match parser - do not remove", parser);
}

const updateAppIfExists = async (context: vscode.ExtensionContext, templates: ITemplates, entityName: string, activeOperations: string[]) => {
  const fsProj = locateFsproject(getRootFolder());
  if (!fsProj) {
    window.showWarningMessage('Could not locate the fsproj file, router will not be updated.');
    return;
  }
  const appTypesPath = path.join(path.dirname(fsProj), 'AppTypes.fs');
  if (!fs.existsSync(appTypesPath)) {
    window.showWarningMessage('No app types found. Try running "Scaffold Fable-Elmish Application Components" to generate components.')
    return;
  }
  const appStatePath = path.join(path.dirname(fsProj), 'AppState.fs');
  if (!fs.existsSync(appStatePath)) {
    window.showWarningMessage('No app state found. Try running "Scaffold Fable-Elmish Application Components" to generate components.')
    return;
  }
  const appPath = path.join(path.dirname(fsProj), 'App.fs');
  if (!fs.existsSync(appPath)) {
    window.showWarningMessage('No app found. Try running "Scaffold Fable-Elmish Application Components" to generate components.')
    return;
  }
  
  const properties: ITemplateProperties = {
    rootNamespace: entityName,
    operation: "app",
    entityName: entityName,
    camelEntityName: entityName[0].toLowerCase() + entityName.substring(1),
    hasIndex: activeOperations.indexOf('index') > -1,
    hasShow: activeOperations.indexOf('show') > -1,
    hasUpdate: activeOperations.indexOf('update') > -1,
    hasCreate: activeOperations.indexOf('create') > -1
  };

  const appRender = templates._appRender(properties);
  const appStateUpdate = templates._appStateUpdate(properties);
  const appStateUrlUpdate = templates._appStateUrlUpdate(properties);
  const appTypesDispatcherMsg = templates._appTypesDispatcherMsg(properties);
  const appTypesDispatcherModel = templates._appTypesDispatcherModel(properties);
  const appTypesDispatcherModelInit = templates._appTypesDispatcherModelInit(properties);

  await writeAndInsertAsset(appPath, "begin dispatcher rendering - do not remove", appRender);
  await writeAndInsertAsset(appStatePath, "begin dispatcher url update - do not remove", appStateUrlUpdate);
  await writeAndInsertAsset(appStatePath, "begin dispatcher update - do not remove", appStateUpdate);
  await writeAndInsertAsset(appTypesPath, "begin dispatcher messages - do not remove", appTypesDispatcherMsg);
  await writeAndInsertAsset(appTypesPath, "begin dispatcher models - do not remove", appTypesDispatcherModel);
  await writeAndInsertAsset(appTypesPath, "begin dispatcher model initialisation - do not remove", appTypesDispatcherModelInit);
}

export const command = async (context: vscode.ExtensionContext) => {
  const templates = loadTemplates(context);
  const rootFolder = getRootFolder();
  const fsProj = locateFsproject(rootFolder);

  if (fsProj) {
    window.showInformationMessage(`Using ${path.basename(fsProj)}`);
  }

  const entityName = await showInputBox();
  const activeOperations: string[] = [];
  if (!entityName) return;

  for (let operationIndex = 0; operationIndex < operations.length; operationIndex++) {
    const includeOperation = await showYesNo(`Scaffold ${operations[operationIndex]}`);
    if (includeOperation === undefined) return; // cancelled
    activeOperations.push(operations[operationIndex]);
  }

  const areaFolder = path.join(rootFolder, entityName);
  fs.mkdirSync(areaFolder);

  const itemGroupContent: string[] = [];
  activeOperations.forEach(operation => {
    const templateSet = templates[operation.toLowerCase()] as IOperations;
    const operationAsPath = operation[0].toUpperCase() + operation.substring(1);
    const operationFolder = path.join(areaFolder, operationAsPath);
    fs.mkdirSync(operationFolder);
    const properties: ITemplateProperties = {
      rootNamespace: entityName,
      operation: operation,
      camelEntityName: entityName[0].toLowerCase() + entityName.substring(1),
      entityName: entityName,
      hasIndex: activeOperations.indexOf('index') > -1,
      hasShow: activeOperations.indexOf('show') > -1,
      hasUpdate: activeOperations.indexOf('update') > -1,
      hasCreate: activeOperations.indexOf('create') > -1
    };

    // order is important here - has to be types, api, state, view
    // we need to push to itemGroupContent in this order so that 
    if (templateSet.types) {
      const typeFs = templateSet.types(properties);
      const typeFsPath = path.join(operationFolder, "Types.fs");
      fs.writeFileSync(typeFsPath, typeFs);
      if (fsProj) {
        itemGroupContent.push(path.relative(path.dirname(fsProj), typeFsPath));
      }
    }

    if (templateSet.api) {
      const apiFs = templateSet.api(properties);
      const apiFsPath = path.join(operationFolder, "Api.fs");
      fs.writeFileSync(apiFsPath, apiFs);
      if (fsProj) {
        itemGroupContent.push(path.relative(path.dirname(fsProj), apiFsPath));
      }
    }

    if (templateSet.state) {
      const stateFs = templateSet.state(properties);
      const stateFsPath = path.join(operationFolder, "State.fs");
      fs.writeFileSync(stateFsPath, stateFs);
      if (fsProj) {
        itemGroupContent.push(path.relative(path.dirname(fsProj), stateFsPath));
      }
    }

    if (templateSet.view) {
      const viewFs = templateSet.view(properties);
      const viewFsPath = path.join(operationFolder, "View.fs");
      fs.writeFileSync(viewFsPath, viewFs);
      if (fsProj) {
        itemGroupContent.push(path.relative(path.dirname(fsProj), viewFsPath));
      }
    }
  });

  if (fsProj && itemGroupContent.length > 0) {
    await addToFsProjAfterRouter(fsProj, itemGroupContent);
  }

  await updateRouterIfExists(context, templates, entityName, activeOperations);
  await updateAppIfExists(context, templates, entityName, activeOperations);
}
