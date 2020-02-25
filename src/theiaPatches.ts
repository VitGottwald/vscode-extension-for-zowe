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

/**
 * Function to upload a data set to mainframe without using etag. Data set will be overwritten.
 * @param {IZoweDatasetTreeNode} node - data set tree node
 * @param {vscode.TextDocument} doc - document that is being uploaded
 * @param {string} path - remote path
 * @param {IProfileLoaded} profile - profile used for upload
 * @returns void
 */
export function willForceUploadDataSet(node: IZoweDatasetTreeNode,
                                       doc: vscode.TextDocument,
                                       path: string,
                                       profile?: IProfileLoaded): void{
    // Upload without passing the etag
    const uploadOptions: IUploadOptions = {
        returnEtag: true
    };

    vscode.window.showWarningMessage(localize("saveFile.error.theiaDetected", "A merge conflict have been detected. Since you are running inside a Theia editor, a merge conflict resolution is not available."));
    vscode.window.showInformationMessage(localize("saveFile.info.confirmUpload","Would you like to overwrite the remote file?"),
                                         localize("saveFile.overwriteConfirmation.yes", "Yes"),
                                         localize("saveFile.overwriteConfirmation.no", "No"))
    .then((selection) => {
        if (selection === localize("saveFile.overwriteConfirmation.yes", "Yes")) {
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
            markFileAsDirty(doc);
        }
    });
}

/**
 * Function to upload a file to USS mainframe without using etag. Data set will be overwritten.
 * @param {IZoweUSSTreeNode} node - uss tree node
 * @param {vscode.TextDocument} doc - document that is being uploaded
 * @param {IProfileLoaded} profile - profile used for upload
 * @param {string} remote - remote path
 * @param {boolean} binary - flag to signal binary upload
 * @param {boolean} returnEtag - flag to signal if etag should be returned
 * @returns void
 */
export function willForceUploadUSS(node: IZoweUSSTreeNode,
                                   doc: vscode.TextDocument,
                                   profile: IProfileLoaded,
                                   remote: string,
                                   binary: boolean,
                                   returnEtag: boolean): void {

    vscode.window.showWarningMessage(localize("saveFile.error.theiaDetected", "A merge conflict have been detected. Since you are running inside a Theia editor, a merge conflict resolution is not available."));
    vscode.window.showInformationMessage(localize("saveFile.info.confirmUpload","Would you like to overwrite the remote file?"),
                                         localize("saveFile.overwriteConfirmation.yes", "Yes"),
                                         localize("saveFile.overwriteConfirmation.no", "No"))
    .then((selection) => {
        if (selection === localize("saveFile.overwriteConfirmation.yes", "Yes")) {
            const uploadResponse = vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: localize("saveUSSFile.response.title", "Saving file...")
            }, () => {
                return ZoweExplorerApiRegister.getUssApi(profile).putContents(
                    doc.fileName, remote, binary, null, null, returnEtag);
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
            markFileAsDirty(doc);
        }
    });
}

/**
 * Helper function that rewrites the document in the active editor thus marking it dirty
 * @param {vscode.TextDocument} doc - document to rewrite
 * @returns void
 */

function markFileAsDirty(doc: vscode.TextDocument): void {
    const docText = doc.getText();
    const startPosition = new vscode.Position(0, 0);
    const endPosition = new vscode.Position(doc.lineCount, 0);
    const deleteRange = new vscode.Range(startPosition, endPosition);
    vscode.window.activeTextEditor.edit((editBuilder) => {
        editBuilder.delete(deleteRange);
        editBuilder.insert(startPosition, docText);
    });
}
