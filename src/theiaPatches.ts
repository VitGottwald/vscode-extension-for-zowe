/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

import * as vscode from "vscode";
import * as nls from "vscode-nls";
import { ZoweExplorerApiRegister } from "./api/ZoweExplorerApiRegister";
import { IUploadOptions } from "@zowe/cli";
import { IProfileLoaded } from "@zowe/imperative";
import { IZoweDatasetTreeNode, IZoweUSSTreeNode } from "./api/IZoweTreeNode";

// Localization support
const localize = nls.config({messageFormat: nls.MessageFormat.file})();

export function willForceUploadDataSet(node: IZoweDatasetTreeNode,
                                       doc: vscode.TextDocument,
                                       path: string,
                                       profile?: IProfileLoaded){
    // Upload without passing the etag
    const uploadOptions: IUploadOptions = {
        returnEtag: true
    };

    vscode.window.showWarningMessage(localize("saveFile.error.TheiaDetected", "A merge conflict have been detected. Since you are running inside a Theia editor, a merge conflict resolution is not available."));
    vscode.window.showInformationMessage(localize("saveFile.info.confirmUpload","Would you like to overwrite the remote file?"), "Yes", "No")
    .then((selection) => {
        if (selection.toLowerCase() === "yes") {
            vscode.window.showInformationMessage("WILL UPLOAD");
            const uploadResponse = vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: localize("saveFile.response.save.title", "Saving data set...")
            }, () => {
                return ZoweExplorerApiRegister.getMvsApi(node ? node.getProfile(): profile).putContents(doc.fileName,
                    path,
                    uploadOptions);
            });
            uploadResponse.then((response) => {
                if (response.success) {
                    vscode.window.showInformationMessage(response.commandResponse);
                    if (node) {
                        node.setEtag(response.apiResponse[0].etag);
                    }
                }
            });
        } else {
            vscode.window.showInformationMessage("Upload cancelled.");
            const docText = doc.getText();
            const startPosition = new vscode.Position(0, 0);
            const endPosition = new vscode.Position(doc.lineCount, 0);
            const deleteRange = new vscode.Range(startPosition, endPosition);
            vscode.window.activeTextEditor.edit((editBuilder) => {
                // re-write the old content in the editor view
                editBuilder.delete(deleteRange);
                editBuilder.insert(startPosition, docText);
            });
        }
    });
}
export function willForceUploadUSS(node: IZoweDatasetTreeNode,
                                   doc: vscode.TextDocument,
                                   profile: IProfileLoaded,
                                   remote: string,
                                   binary: boolean,
                                   returnEtag: boolean){

    vscode.window.showWarningMessage(localize("saveFile.error.TheiaDetected", "A merge conflict have been detected. Since you are running inside a Theia editor, a merge conflict resolution is not available."));
    vscode.window.showInformationMessage(localize("saveFile.info.confirmUpload","Would you like to overwrite the remote file?"), "Yes", "No")
    .then((selection) => {
        if (selection.toLowerCase() === "yes") {
            vscode.window.showInformationMessage("WILL UPLOAD");
            const uploadResponse = vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: localize("saveUSSFile.response.title", "Saving file...")
            }, () => {
                return ZoweExplorerApiRegister.getUssApi(profile).putContents(
                    doc.fileName, remote, binary, null, null, returnEtag);  // TODO MISSED TESTING
            });
            uploadResponse.then((response) => {
                if (response.success) {
                    vscode.window.showInformationMessage(response.commandResponse);
                    if (node) {
                        node.setEtag(response.apiResponse[0].etag);
                    }
                }
            });
        } else {
            vscode.window.showInformationMessage("Upload cancelled.");
            const docText = doc.getText();
            const startPosition = new vscode.Position(0, 0);
            const endPosition = new vscode.Position(doc.lineCount, 0);
            const deleteRange = new vscode.Range(startPosition, endPosition);
            vscode.window.activeTextEditor.edit((editBuilder) => {
                // re-write the old content in the editor view
                editBuilder.delete(deleteRange);
                editBuilder.insert(startPosition, docText);
            });
        }
    });
}
