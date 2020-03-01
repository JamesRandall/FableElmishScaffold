import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { window } from 'vscode';
import * as handlebars from 'handlebars';

import { locateFsproject, ITemplates, getRootFolder, operations, showYesNo } from './common';

interface ITemplateProperties {
  rootNamespace: string
  operation: string
  entityName: string,
  hasIndex: boolean,
  hasShow: boolean,
  hasUpdate: boolean,
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
  let templatesRootPath = path.join(context.extensionPath, 'src', 'templates');
  const fsproj = locateFsproject(getRootFolder());
  if (fsproj) {
    const fsProj = locateFsproject(getRootFolder());
    if (fsProj) {
      const destPath = path.join(path.dirname(fsProj), ".fable-elmish-templates");
      if (fs.existsSync(destPath)) {
        templatesRootPath = destPath;
      }
    }
  }

  const result : ITemplates = { index: { }, show: { }, create: { }, update: { }, dispatcher: { } }

  operations.forEach(operation => {
    const typesPath = path.join(templatesRootPath, `${operation}Types.hbr`);
    const restPath = path.join(templatesRootPath, `${operation}Rest.hbr`);
    const statePath = path.join(templatesRootPath, `${operation}State.hbr`);
    const viewPath = path.join(templatesRootPath, `${operation}View.hbr`);
    result[operation] = {
      types: handlebars.compile(fs.readFileSync(typesPath).toString()),
      rest: fs.existsSync(restPath) ? handlebars.compile(fs.readFileSync(restPath).toString()) : undefined,
      state: handlebars.compile(fs.readFileSync(statePath).toString()),
      view: handlebars.compile(fs.readFileSync(viewPath).toString())
    }
  });

  return result;
}

export const command = async (context: vscode.ExtensionContext) => {
  const templates = loadTemplates(context);
    const rootFolder = getRootFolder();
    const fsProj = locateFsproject(rootFolder);

    if (fsProj) {
      window.showInformationMessage(`Using ${path.basename(fsProj)}`);
    }

    const entityName = await showInputBox();
    const activeOperations : string[] = [];
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
      const templateSet = templates[operation.toLowerCase()];
      const operationAsPath = operation[0].toUpperCase() + operation.substring(1);
      const operationFolder = path.join(areaFolder, operationAsPath);
      fs.mkdirSync(operationFolder);
      const properties : ITemplateProperties = {
        rootNamespace: entityName,
        operation: operation,
        entityName: entityName,
        hasIndex: activeOperations.indexOf('index') > -1,
        hasShow: activeOperations.indexOf('show') > -1,
        hasUpdate: activeOperations.indexOf('update') > -1,
        hasCreate: activeOperations.indexOf('create') > -1
      };

      // order is important here - has to be types, rest, state, view
      // we need to push to itemGroupContent in this order so that 
      if (templateSet.types) {
        const typeFs = templateSet.types(properties);
        const typeFsPath = path.join(operationFolder, "Types.fs");
        fs.writeFileSync(typeFsPath, typeFs);
        if (fsProj) {
          itemGroupContent.push(path.relative(path.dirname(fsProj), typeFsPath));
        }        
      }

      if (templateSet.rest) {
        const restFs = templateSet.rest(properties);
        const restFsPath = path.join(operationFolder, "Rest.fs");
        fs.writeFileSync(restFsPath, restFs);
        if (fsProj) {
          itemGroupContent.push(path.relative(path.dirname(fsProj), restFsPath));
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
      
      const projectDoc = await vscode.workspace.openTextDocument(fsProj);
      const textEditor = await vscode.window.showTextDocument(projectDoc);
      vscode.window
      const eol = projectDoc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";

      // Better way to do this I'm sure - but will do for now!
      let lineNumber = projectDoc.lineCount-1;
      while (lineNumber >= 0) {
        const line = projectDoc.lineAt(lineNumber);
        if (line.text.lastIndexOf("</Project>") >= 0) {
          let xmlOutput = `${eol}  <ItemGroup>${eol}`;
          itemGroupContent.forEach(f => xmlOutput += `    <Compile Include="${f}" />${eol}`);
          xmlOutput += `  </ItemGroup>${eol}`;
          textEditor.edit(builder => {
            const position = new vscode.Position(lineNumber, 0);
            builder.insert(position, xmlOutput);
          });
        }
        lineNumber--;
      }
    }
}