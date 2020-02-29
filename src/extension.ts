// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export async function showInputBox() {
  const result = await window.showInputBox({
    value: '',
    placeHolder: 'Enter entity name',
    validateInput: text => {
      return text.trim().length > 0 ? null : 'Required';
    }
  });
  return result;
}

export async function showYesNo(placeholder: string) {
  const result = await window.showQuickPick(['Yes', 'No'], {
    canPickMany: false,
    placeHolder: placeholder
  });

  return result === undefined ? undefined : result?.toLowerCase() === 'no';
}

interface IOperations {
  types: HandlebarsTemplateDelegate<any>
  rest?: HandlebarsTemplateDelegate<any> | undefined
  state: HandlebarsTemplateDelegate<any>
  view: HandlebarsTemplateDelegate<any>
}

interface ITemplates {
  [key: string]: IOperations

  index: IOperations
  show: IOperations
  create: IOperations
  update: IOperations
}

interface ITemplateProperties {
  rootNamespace: string
  operation: string
  entityName: string
}

const getRootFolder = () => window.activeTextEditor ? path.dirname(window.activeTextEditor?.document.fileName) : vscode.workspace.rootPath!;
const getEjectedTemplatePath = () => {
  
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
  return {
    index: {
      types: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'indexTypes.hbr')).toString()),
      rest: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'indexRest.hbr')).toString()),
      state: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'indexState.hbr')).toString()),
      view: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'view.hbr')).toString())
    },
    show: {
      types: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'showTypes.hbr')).toString()),
      rest: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'showRest.hbr')).toString()),
      state: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'showState.hbr')).toString()),
      view: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'view.hbr')).toString())
    },
    create: {
      types: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'createTypes.hbr')).toString()),
      state: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'createState.hbr')).toString()),
      view: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'view.hbr')).toString())
    },
    update: {
      types: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'updateTypes.hbr')).toString()),
      state: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'updateState.hbr')).toString()),
      view: handlebars.compile(fs.readFileSync(path.join(templatesRootPath, 'view.hbr')).toString())
    }
  };
}

const locateFsproject = (fromPath: string): string | undefined => {
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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "fable-elmish-generator" is now active!');

  let ejectScaffoldTemplates = vscode.commands.registerCommand('extension.ejectScaffoldTemplates', async () => {
    const fsProj = locateFsproject(getRootFolder());
    if (!fsProj) return;
    const destPath = path.join(path.dirname(fsProj), ".fable-elmish-templates");
    if (fs.existsSync(destPath))
    {
      const result = showYesNo("Overwrite existing ejected templates?");
      if (!result) return;
    }
    else
    {
      fs.mkdirSync(destPath);
    }
    
    const templatesRootPath = path.join(context.extensionPath, 'src', 'templates');
    const files = fs.readdirSync(templatesRootPath).filter(f => f.toLowerCase().endsWith(".hbr"));
    files.forEach(f => fs.copyFileSync(path.join(templatesRootPath, f), path.join(destPath, f)));
  });
  
  let generateFullScaffold = vscode.commands.registerCommand('extension.generateFullScaffold', async () => {
    const templates = loadTemplates(context);
    const rootFolder = getRootFolder();
    const fsProj = locateFsproject(rootFolder);

    if (fsProj) {
      window.showInformationMessage(`Using ${path.basename(fsProj)}`);
    }

    const entityName = await showInputBox();
    const operations = [];
    if (!entityName) return;
    const includeIndex = await showYesNo('Generate index?');
    if (includeIndex === undefined) return; else operations.push('Index');
    const includeShow = await showYesNo('Generate show?');
    if (includeShow === undefined) return; else operations.push('Show');
    const includeCreate = await showYesNo('Generate create?');
    if (includeCreate === undefined) return; else operations.push('Create');
    const includeUpdate = await showYesNo('Generate update?');
    if (includeUpdate === undefined) return; else operations.push('Update');

    const areaFolder = path.join(rootFolder, entityName);
    fs.mkdirSync(areaFolder);

    const itemGroupContent: string[] = [];
    operations.forEach(operation => {
      const templateSet = templates[operation.toLowerCase()];
      const operationFolder = path.join(areaFolder, operation);
      fs.mkdirSync(operationFolder);
      const properties = {
        rootNamespace: entityName,
        operation: operation,
        entityName: entityName
      };

      const typeFs = templateSet.types(properties);
      const typeFsPath = path.join(operationFolder, "Types.fs");
      fs.writeFileSync(typeFsPath, typeFs);

      const stateFs = templateSet.state(properties);
      const stateFsPath = path.join(operationFolder, "State.fs");
      fs.writeFileSync(stateFsPath, stateFs);

      let restFsPath = undefined;
      if (templateSet.rest) {
        const restFs = templateSet.rest(properties);
        restFsPath = path.join(operationFolder, "Rest.fs");
        fs.writeFileSync(restFsPath, restFs);
      }

      const viewFs = templateSet.view(properties);
      const viewFsPath = path.join(operationFolder, "View.fs");
      fs.writeFileSync(viewFsPath, viewFs);

      if (fsProj) {
        // order is important here - has to be types, rest, state, view
        itemGroupContent.push(path.relative(path.dirname(fsProj), typeFsPath));
        if (restFsPath) {
          itemGroupContent.push(path.relative(path.dirname(fsProj), restFsPath));
        }
        itemGroupContent.push(path.relative(path.dirname(fsProj), stateFsPath));
        itemGroupContent.push(path.relative(path.dirname(fsProj), viewFsPath));
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
  });

  context.subscriptions.push(generateFullScaffold);
  context.subscriptions.push(ejectScaffoldTemplates);
}

// this method is called when your extension is deactivated
export function deactivate() { }
