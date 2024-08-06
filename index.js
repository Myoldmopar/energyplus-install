const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');
const tar = require("tar");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
	// validate and get inputs from the action workflow  
	const version = core.getInput('version');
    const hardened = core.getInput('hardened');  
    
    // leave gracefully if something is wrong
    const url = "https://github.com/NREL/EnergyPlus/releases/download/v24.1.0/EnergyPlus-24.1.0-9d7789a3ac-Linux-Ubuntu22.04-x86_64.tar.gz";
    if (url.trim() === "") {
      core.setFailed("Failed to find a URL.");
      return;
    }
    console.log(`URL found: ${url}`);

    // need to generate this dynamically of course
    const extractPath = path.join(process.env.RUNNER_TEMP, 'eplus');

    // make the target save directory
    fs.mkdirSync(extractPath, { recursive: true });
    
    // grab the content
    const tarballPath = await tc.downloadTool(url);
    console.log("Download completed.");

	// now we need to extract the downloaded archive -- more dynamic of course
    await tar.x({
      file: tarballPath,
      cwd: extractPath
    });
    
    const files = fs.readdirSync(extractPath);
    const subdirectory = files.find(file => fs.statSync(path.join(extractPath, file)).isDirectory());
    
    if (!subdirectory) {
      throw new Error('No subdirectory found in the extracted files.');
    }

    const subdirectoryPath = path.join(extractPath, subdirectory);
    
    // set the extracted path
    core.setOutput("energyplus_path", subdirectoryPath);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
