// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ejectScaffoldTemplates from './ejectScaffoldTemplates';
import * as generateFullScaffold from './generateFullScaffold';
import * as scaffoldApplicationComponents from './scaffoldApplicationComponents';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let ejectScaffoldTemplatesDisposer = vscode.commands.registerCommand('extension.ejectScaffoldTemplates', () => ejectScaffoldTemplates.command(context));
  let generateFullScaffoldDisposer = vscode.commands.registerCommand('extension.generateFullScaffold', () => generateFullScaffold.command(context));
  let scaffoldApplicationComponentsDisposer = vscode.commands.registerCommand('extension.scaffoldApplicationComponents', () => scaffoldApplicationComponents.command(context));

  context.subscriptions.push(generateFullScaffoldDisposer);
  context.subscriptions.push(ejectScaffoldTemplatesDisposer);
  context.subscriptions.push(scaffoldApplicationComponentsDisposer);
}

// this method is called when your extension is deactivated
export function deactivate() { }
