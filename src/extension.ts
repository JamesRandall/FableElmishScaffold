// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ejectScaffoldTemplates from './ejectScaffoldTemplates';
import * as generateFullScaffold from './generateFullScaffold';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let ejectScaffoldTemplatesDisposer = vscode.commands.registerCommand('extension.ejectScaffoldTemplates', () => ejectScaffoldTemplates.command(context));
  let generateFullScaffoldDisposer = vscode.commands.registerCommand('extension.generateFullScaffold', () => generateFullScaffold.command(context));

  context.subscriptions.push(generateFullScaffoldDisposer);
  context.subscriptions.push(ejectScaffoldTemplatesDisposer);
}

// this method is called when your extension is deactivated
export function deactivate() { }
