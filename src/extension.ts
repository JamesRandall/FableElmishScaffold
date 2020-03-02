// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ejectScaffoldTemplates from './ejectScaffoldTemplates';
import * as generateFullScaffold from './generateFullScaffold';
import * as exportSettings from './exportSettings';
import * as scaffoldApplicationComponents from './scaffoldApplicationComponents';
import { ISettings, AsyncStyleEnum } from './common';
import * as handlebars from 'handlebars';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {  
  let ejectScaffoldTemplatesDisposer = vscode.commands.registerCommand('extension.ejectScaffoldTemplates', () => ejectScaffoldTemplates.command(context));
  let generateFullScaffoldDisposer = vscode.commands.registerCommand('extension.generateFullScaffold', () => generateFullScaffold.command(context));
  let scaffoldApplicationComponentsDisposer = vscode.commands.registerCommand('extension.scaffoldApplicationComponents', () => scaffoldApplicationComponents.command(context));
  let exportSettingsDisposer = vscode.commands.registerCommand('extension.exportSettings', () => exportSettings.command(context));

  context.subscriptions.push(generateFullScaffoldDisposer);
  context.subscriptions.push(ejectScaffoldTemplatesDisposer);
  context.subscriptions.push(scaffoldApplicationComponentsDisposer);
  context.subscriptions.push(exportSettingsDisposer);

  handlebars.registerHelper('useAsync', function (settings:ISettings) {
    return settings.asyncStyle === AsyncStyleEnum.Async;
  });
  handlebars.registerHelper('usePromise', function (settings:ISettings) {
    return settings.asyncStyle === AsyncStyleEnum.Promise;
  });
  handlebars.registerHelper('ofCmd', function (settings:ISettings) {
    return settings.asyncStyle === AsyncStyleEnum.Promise ? 'OfPromise' : 'OfAsync';
  });
  handlebars.registerHelper('asyncBlock', function (settings:ISettings) {
    return settings.asyncStyle === AsyncStyleEnum.Promise ? 'promise' : 'async';
  });
  handlebars.registerHelper('asyncSleep', function (settings:ISettings) {
    return settings.asyncStyle === AsyncStyleEnum.Promise ? 'Promise.sleep' : 'Async.Sleep';
  });
}

// this method is called when your extension is deactivated
export function deactivate() { }
