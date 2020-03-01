import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as vscode from 'vscode';
import { window } from 'vscode';

export interface IOperations {
  [key: string]: HandlebarsTemplateDelegate<any> | undefined

  types?: HandlebarsTemplateDelegate<any> | undefined
  rest?: HandlebarsTemplateDelegate<any> | undefined
  state?: HandlebarsTemplateDelegate<any> | undefined
  view?: HandlebarsTemplateDelegate<any> | undefined
}

export interface ITemplates {
  [key: string]: IOperations

  index: IOperations
  show: IOperations
  create: IOperations
  update: IOperations
  dispatcher: IOperations
}

export const getRootFolder = () => window.activeTextEditor ? path.dirname(window.activeTextEditor?.document.fileName) : vscode.workspace.rootPath!;

// dispatcher must come at the end
export const operations = [ 'index', 'show', 'create', 'update', 'dispatcher' ];

export const locateFsproject = (fromPath: string): string | undefined => {
  let fsproj = undefined;
  let searchPath = fromPath;
  while (!fsproj) {
    const files = fs.readdirSync(searchPath);
    const candidates = files.filter(f => f.toLowerCase().endsWith(".fsproj"));
    if (candidates.length === 1) {
      fsproj = path.join(searchPath, candidates[0]);
    }
    else if (candidates.length > 1) {
      window.showWarningMessage('Multiple fsproj files in single folder and so cannot update, files will need to be manually added.');
      return undefined;
    }

    if (!fsproj && searchPath.length <= 1) {
      window.showWarningMessage('Could not locate an fsproj file to update, files will need to be manually added.');
      return undefined;
    }
    searchPath = path.join(searchPath, '..');
  }
  return fsproj;
}

export async function showYesNo(placeholder: string) {
  const result = await window.showQuickPick(['Yes', 'No'], {
    canPickMany: false,
    placeHolder: placeholder
  });

  return result === undefined ? undefined : result?.toLowerCase() === 'no';
}