# Visual Studio Code Extension for Zowe

The Visual Studio Code (VSC) Extension for Zowe lets you interact with data sets that are stored on IBM z/OS mainframes. You can explore data sets, view their contents, make changes, and upload those changes to the mainframe. Interacting with data sets from VSC can be more convenient than using command-line interfaces or 3270 emulators. 

The VSC Extension for Zowe is powered by [Zowe CLI](https://zowe.org/home/). The extension demonstrates the potential for plug-ins powered by Zowe.

**Important Note**: This extension is a work in progress and contains native code to retrieve securely stored credentials from Zowe CLI. The version published to the marketplace is built for Visual Studio Code for Windows x64. 

If your architecture differs, you might receive the following error:

`could not retrieve secure field 'user' ...` 

You can attempt to rebuild it for your platform by navigating to the following directory within your home directory (C:\Users\youruserID on Windows, ~ on Mac/ Linux):
 `<yourhomedirectory>/.vscode/extension/zowe.vscode-extension-for-zowe-x.x.x/` where `x.x.x` is the version number of the extension. After navigating to that directory you should be able to issue the command `npm install` to rebuild the extension for your platform. 

If `npm install` does not resolve the error, you can rebuild Keytar manually:

1. In Visual Studio Code, navigate to `Help` -> `About`
2. Note your `Architecture` (most likely ia32)
3. Navigate to the Keytar directory `<yourhomedirectory>/.vscode/extension/zowe.vscode-extension-for-zowe-x.x.x/node_modules/keytar`
4. Open the `package.json` and locate the npm prebuild script for your VSCode architecture (e.g. `prebuild-electron-ia32`)
5. Execute `npm run <the script you chose from (4)>` (e.g. `npm run prebuild-electron-ia32`)

## Table of Contents
* [Prerequisites](#prerequisites)
* [Tips](#configuration-and-usage-tips)
* [Sample use cases](#use-cases)
* [Install Visual Studio Code Extension for Zowe from Source](#install-to-vsc-from-source)
* [Run System Tests](#run-system-tests)


## Prerequisites
Before you install the Zowe extension, meet the following prerequisites:

* [Install Zowe CLI](https://zowe.github.io/docs-site/user-guide/cli-installcli.html) on your PC.
* [Create at least one Zowe CLI 'zosmf' profile](https://zowe.github.io/docs-site/user-guide/cli-installcli.html#creating-a-zowe-cli-profile).

## Configuration and Usage Tips

You can alter the behavior of the extension in the following ways:

* **Safe Save:** The Visual Studio Code *Save* functionality will overwrite data set contents on the mainframe. To prevent conflicts, use the Zowe extension *Safe Save* functionality to compare changes made with initial mainframe contents before saving. See "Use 'Safe Save' to prevent merge conflicts" below for usage details.
* **Data set creation settings:** You can change the default creation settings for various data set types. Navigate to the Settings for this extension for more info. 
* **Data set persistence settings:** You can toggle the persistence of any data sets that are present under your 'Favorites' tab.
  
**Tip:** Visual Studio Code does not highlight data set syntax by default. To enhance the experience of using this extension, download an extension that highlights syntax, such as COBOL.

## Use Cases
Review the following use cases to understand how to use this extension.

### View data sets and use multiple filters
1. Navigate to your explorer tree.
2. Open the 'DATA SETS' bar.
3. Select a profile that you are interested in filtering.
4. Select the 'Search Data Sets by Entering Patterns' button (magnifying glass).
5. A drop-down displays. Enter pattern(s) that you want to filter against. 
  The data sets that match your pattern(s) display in the explorer tree.

**Tip:** To provide multiple filters, separate entries with a comma. You can prepend or append any filter with an \*, which indicates wildcard searching. You cannot enter an \* as the entire pattern. 

![Enter Pattern](https://github.com/mheuzey/temp/blob/master/resources/gifs/patterns.gif?raw=true "Enter Pattern")
<br /><br />

### Refresh the list of data sets

1. Navigate to your explorer tree.
2. Select the 'Refresh All' button on the right of the 'DATA SETS' explorer bar.

![Refresh All](https://github.com/mheuzey/temp/blob/master/resources/gifs/refreshAll.gif?raw=true "Refresh All")
<br /><br />

### Download, edit, and upload an existing PDS member

1. Navigate to your explorer tree.
2. Open the 'DATA SETS' bar.
3. Open a profile.  
4. Click the PDS member (or PS) that you want to download. 
    * To view the members of a PDS, click on the PDS to expand the tree.  
5. The PDS member displays in the text editor window of VSC. 
6. Edit the document.
7. Navigate back to the PDS member (or PS) in the explorer tree, and click the 'Safe Save' button.
Your PDS member (or PS) was uploaded.  

**Note:** If someone else has made changes to this PDS member (or PS) while you were editing it, then you will be able to merge your conflicts before uploading to the mainframe.  

![Edit](https://github.com/mheuzey/temp/blob/master/resources/gifs/download_edit_upload.gif?raw=true "Edit")
<br /><br />

### Use 'Safe Save' to prevent merge conflicts

1. Navigate to your explorer tree.
3. Open the 'DATA SETS' bar.
3. Open a profile.
4. Download and edit a data set.
5. Click the 'Safe Save' button for the data set that you opened in the explorer tree.
6. Resolve merge conflicts if necessary.

![Safe Save](https://github.com/mheuzey/temp/blob/master/resources/gifs/safesave.gif?raw=true "Safe Save")
<br /><br />

### Create a new PDS and a PDS member

1. Navigate to your explorer tree.
2. Open the 'DATA SETS' bar.
3. Select the 'Create New Data Set' button for the profile with which you want to create the new data set.
4. Select the type of PDS you would want to create from the drop-down menu.
5. Enter a name for the PDS.
   The PDS is created.
6. To create a member, right-click the PDS and select 'Create New Member'
7. Enter a name for the member.
   The member is created. 

![Create](https://github.com/mheuzey/temp/blob/master/resources/gifs/new_pds_new_member.gif?raw=true "Create")
<br /><br />

### Delete a PDS member and a PDS

1. Navigate to your explorer tree.
2. Open the 'DATA SETS' bar.
3. Open the profile and PDS containing the member.
4. Right-click on the PDS member you want to delete and select 'Delete Member'.
5. Confirm the deletion by selecting 'Yes' in the drop-down menu.
    * Alternatively, you can select 'No' to cancel the deletion.
6. To delete a PDS right-click on it, select 'Delete PDS', then confirm the deletion.
    * You can delete a PDS without deleting its members first.

![Delete](https://github.com/mheuzey/temp/blob/master/resources/gifs/delete_pds_delete_member.gif?raw=true "Delete")
<br /><br />

### View and access multiple profiles simultaneously 

1. Navigate to your explorer tree.
2. Open the 'DATA SETS' bar.
2. Click the 'Add Profile' button on the right of the 'DATA SET' explorer bar.
3. Select the profile that you want to add to the view.

![Add Profile](https://github.com/mheuzey/temp/blob/master/resources/gifs/addProfile.gif?raw=true "Add Profile")
<br /><br />

### Add and edit information that pertains to how data sets are created

1. Navigate to to File > Preferences > Settings.
2. In 'Default User Settings', scroll down to 'Zowe Configuration' and expand the options.
3. Click the 'Edit' button to the left of the Data Set settings that you want to edit.
4. Select 'Copy to Settings'.
5. Edit the settings as needed.

## Install to VSC from Source
You can build the extension (VSIX file) from this source repository and install it to VSC.  

**Note:** Follow the [instructions  for creating testProfileData.ts](#run-system-tests) before performing these steps.

### Build the Extension
From your local copy of this repository, issue the following commands to create the VSIX package file from source:

1. `npm install`
2. `npm run package`
   This creates a `.vsix` file in your local copy of the project.

### Install the Extension to VSC 
After you create a VSIX file, install the extension to VSC:

1. Navigate to the Extensions menu in Visual Studio Code and click the **...** menu on the top-left. 
2. Select Install from VSIX and select the `.vsix` file that was created by your `npm run package` command. 
3. Restart Visual Studio Code.
The extension is installed. 

## Run System Tests

In your copy of this repository, create a `testProfileData.ts` file in the `resources` directory. In this file, include the following text with your credentials:

```typescript
import { IProfile } from "@brightside/imperative";

export const profile: IProfile = {
    type : "zosmf",
    host: "",
    port: 0,
    user: "",
    pass: "",
    rejectUnauthorized: false,
    name: ""
};

export const normalPattern = "";
export const orPattern = "";
```

The above example content can also be copied from ./resources/testProfileData.example.ts

To test the extension, the mainframe data sets under `normalPattern` must match the following structures:

* `normalPattern` + ".EXT.PDS"
  * "MEMBER"
* `normalPattern` + ".EXT.PS"
* `normalPattern` + ".EXT.SAMPLE.PDS"
* `normalPattern` + ".PUBLIC.BIN"
* `normalPattern` + ".PUBLIC.TCLASSIC"
  * "NEW"
* `normalPattern` + ".PUBLIC.TPDS"
  * "TCHILD1"
  * "TCHILD2"
* `normalPattern` + ".PUBLIC.TPS"

There is no required structure for the mainframe data sets under `orPattern`.

To run the tests, open your copy of the repository in VSC,  [build the extension](#build-the-extension), and open the *Debug* panel on the left. Select `Integration Tests Mocha)` from the drop down next to the green play button and press the play button. The tests will then run and the output will go to your VSC debug console. 