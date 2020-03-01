import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as vscode from 'vscode';
import { window } from 'vscode';

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

export const getTemplateRootPath = (context: vscode.ExtensionContext) => {
  let templatesRootPath = path.join(context.extensionPath, 'templates');
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
  return templatesRootPath;
}

export const addToFsProj = async (fsProjPath: string, items: string[]) => {
  const projectDoc = await vscode.workspace.openTextDocument(fsProjPath);
  const textEditor = await vscode.window.showTextDocument(projectDoc);
  vscode.window
  const eol = projectDoc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";

  // Better way to do this I'm sure - but will do for now!
  let lineNumber = projectDoc.lineCount - 1;
  while (lineNumber >= 0) {
    const line = projectDoc.lineAt(lineNumber);
    if (line.text.lastIndexOf("</Project>") >= 0) {
      let xmlOutput = `${eol}  <ItemGroup>${eol}`;
      items.forEach(f => xmlOutput += `    <Compile Include="${f}" />${eol}`);
      xmlOutput += `  </ItemGroup>${eol}`;
      await textEditor.edit(builder => {
        const position = new vscode.Position(lineNumber, 0);
        builder.insert(position, xmlOutput);
      });
    }
    lineNumber--;
  }

  await projectDoc.save();
}

export const addToFsProjAfterRouter = async (fsProjPath: string, items: string[]) => {
  const projectDoc = await vscode.workspace.openTextDocument(fsProjPath);
  const textEditor = await vscode.window.showTextDocument(projectDoc);
  vscode.window
  const eol = projectDoc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
  let foundLine = -1;

  for (let lineNumber = 0; lineNumber < projectDoc.lineCount - 1; lineNumber++) {
    const line = projectDoc.lineAt(lineNumber).text.toLowerCase();
    if (line.indexOf(`<Compile Include="Router.fs" />`.toLowerCase()) > -1) {
      foundLine = lineNumber;
      break;
    }
  }

  if (foundLine === -1) {
    window.showWarningMessage("Attempted to add files after router but it could not be found, adding in separate item group");
    await addToFsProj(fsProjPath, items);
  } else {
    let xmlOutput = '';
    items.forEach(f => xmlOutput += `    <Compile Include="${f}" />${eol}`);
    await textEditor.edit(builder => {
      const position = new vscode.Position(foundLine + 1, 0);
      builder.insert(position, xmlOutput);
    });
    await projectDoc.save();
  }
}