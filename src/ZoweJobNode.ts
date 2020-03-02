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
import * as zowe from "@zowe/cli";
import { Session, IProfileLoaded } from "@zowe/imperative";
import * as extension from "./extension";
import { IZoweJobTreeNode } from "./api/IZoweTreeNode";
import { ZoweTreeNode } from "./abstract/ZoweTreeNode";
import * as utils from "./utils";
import { ZoweExplorerApiRegister } from "./api/ZoweExplorerApiRegister";
import * as nls from "vscode-nls";

// Set up localization
nls.config({ messageFormat: nls.MessageFormat.bundle, bundleFormat: nls.BundleFormat.standalone })();
const localize: nls.LocalizeFunc = nls.loadMessageBundle();

// tslint:disable-next-line: max-classes-per-file
export class Job extends ZoweTreeNode implements IZoweJobTreeNode {
    public static readonly JobId = "JobId:";
    public static readonly Owner = "Owner:";
    public static readonly Prefix = "Prefix:";

    public children: IZoweJobTreeNode[] = [];
    public dirty = extension.ISTHEIA;  // Make sure this is true for theia instances
    // tslint:disable-next-line: variable-name
    private _owner: string;
    // tslint:disable-next-line: variable-name
    private _prefix: string;
    // tslint:disable-next-line: variable-name
    private _searchId: string;

    constructor(label: string,
                collapsibleState: vscode.TreeItemCollapsibleState,
                mParent: IZoweJobTreeNode,
                session: Session,
                public job: zowe.IJob,
                profile: IProfileLoaded) {
        super(label, collapsibleState, mParent, session, profile);
        if (session) {
            this._owner = session.ISession.user;
        }
        this._prefix = "*";
        this._searchId = "";
        utils.applyIcons(this);
    }

    /**
     * Retrieves child nodes of this IZoweJobTreeNode
     *
     * @returns {Promise<IZoweJobTreeNode[]>}
     */
    public async getChildren(): Promise<IZoweJobTreeNode[]>  {
        if (this.dirty) {
            let spools: zowe.IJobFile[] = [];
            const elementChildren = [];
            if (this.contextValue === extension.JOBS_JOB_CONTEXT || this.contextValue === extension.JOBS_JOB_CONTEXT + extension.FAV_SUFFIX) {
                spools = await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: localize("ZoweJobNode.getJobs.spoolfiles", "Get Job Spool files command submitted.")
                }, () => {
                   return ZoweExplorerApiRegister.getJesApi(this.getProfile()).getSpoolFiles(this.job.jobname, this.job.jobid);
                });
                spools.forEach((spool) => {
                    const existing = this.children.find((element) => element.label.trim() === `${spool.stepname}:${spool.ddname}(${spool.id})` );
                    if (existing) {
                        elementChildren.push(existing);
                    } else {
                        let prefix = spool.stepname;
                        if (prefix === undefined) {
                            prefix = spool.procstep;
                        }
                        const sessionName = this.contextValue === extension.JOBS_JOB_CONTEXT + extension.FAV_SUFFIX ?
                            this.label.substring(1, this.label.lastIndexOf("]")).trim() :
                            this.getProfileName();
                        const spoolNode = new Spool(`${spool.stepname}:${spool.ddname}(${spool.id})`,
                            vscode.TreeItemCollapsibleState.None, this, this.session, spool, this.job, this);
                        spoolNode.iconPath = utils.applyIcons(spoolNode);
                        spoolNode.command = { command: "zowe.zosJobsOpenspool", title: "", arguments: [sessionName, spool] };
                        elementChildren.push(spoolNode);
                    }
                });
            } else {
                const jobs = await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: localize("ZoweJobNode.getJobs.jobs", "Get Jobs command submitted.")
                }, () => {
                   return this.getJobs(this._owner, this._prefix, this._searchId);
                });
                jobs.forEach((job) => {
                    let nodeTitle: string;
                    if (job.retcode) {
                        nodeTitle = `${job.jobname}(${job.jobid}) - ${job.retcode}`;
                    } else {
                        nodeTitle = `${job.jobname}(${job.jobid}) - ${job.status}`;
                    }
                    const existing = this.children.find((element) => element.label.trim() === nodeTitle );
                    if (existing) {
                        elementChildren.push(existing);
                    } else {
                        const jobNode = new Job(nodeTitle, vscode.TreeItemCollapsibleState.Collapsed, this, this.session, job, this.getProfile());
                        jobNode.command = { command: "zowe.zosJobsSelectjob", title: "", arguments: [jobNode] };
                        jobNode.contextValue = extension.JOBS_JOB_CONTEXT;
                        if (!jobNode.iconPath) {
                            jobNode.iconPath = utils.applyIcons(jobNode);
                        }
                        elementChildren.push(jobNode);
                    }
                });
            }
            elementChildren.sort((a, b) => {
                if (a.job.jobid > b.job.jobid) { return 1; }
                if (a.job.jobid < b.job.jobid) { return -1; }
                return 0;
            });
            this.children = elementChildren;
        }
        this.dirty = false;
        return this.children;
    }

    public getSessionNode(): IZoweJobTreeNode {
        return this.getParent() ? this.getParent().getSessionNode() : this;
    }

    get tooltip(): string {
        if (this.job !== null) {
            if (this.job.retcode) {
                return `${this.job.jobname}(${this.job.jobid}) - ${this.job.retcode}`;
            } else {
                return `${this.job.jobname}(${this.job.jobid})`;
            }
        } else if (this.searchId.length>0) {
            return `${this.label} - job id: ${this.searchId}`;
        } else {
            return `${this.label} - owner: ${this.owner} prefix: ${this.prefix}`;
        }
    }

    set owner(newOwner: string) {
        if (newOwner !== undefined) {
            if (newOwner.length === 0) {
                this._owner = this.session.ISession.user;
            } else {
                this._owner = newOwner;
            }
        }
    }

    get owner() {
        return this._owner;
    }

    set prefix(newPrefix: string) {
        if (newPrefix !== undefined) {
            if (newPrefix.length === 0) {
                this._prefix = "*";
            } else {
                this._prefix = newPrefix;
            }
        }
    }

    get prefix() {
        return this._prefix;
    }

    public set searchId(newId: string) {
        if (newId !== undefined) {
            this._searchId = newId;
        }
    }

    public get searchId() {
        return this._searchId;
    }

    private async getJobs(owner, prefix, searchId): Promise<zowe.IJob[]> {
        let jobsInternal: zowe.IJob[] = [];
        if (this.searchId.length > 0 ) {
            jobsInternal.push(await ZoweExplorerApiRegister.getJesApi(this.getProfile()).getJob(searchId));
        } else {
            try {
                jobsInternal = await ZoweExplorerApiRegister.getJesApi(this.getProfile()).getJobsByOwnerAndPrefix(owner, prefix);
            } catch (error) {
                await utils.errorHandling(error, this.label, localize("getChildren.error.response", "Retrieving response from ") + `zowe.GetJobs`);
            }
        }
        return jobsInternal;
    }
}

// tslint:disable-next-line: max-classes-per-file
class Spool extends Job {
    constructor(label: string, mCollapsibleState: vscode.TreeItemCollapsibleState, mParent: IZoweJobTreeNode,
                session: Session, spool: zowe.IJobFile, job: zowe.IJob, parent: IZoweJobTreeNode) {
        super(label, mCollapsibleState, mParent, session, job, parent.getProfile());
        this.contextValue = extension.JOBS_SPOOL_CONTEXT;
        utils.applyIcons(this);
    }
}
