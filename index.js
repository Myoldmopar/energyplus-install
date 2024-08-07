const fs = require("fs");
const path = require("path");
const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');
const tar = require("tar");
const extract = require('extract-zip')

async function main() {
	try {
		// validate and get inputs from the action workflow
		const tag = core.getInput('tag');
		const hardened = core.getInput('hardened');
		// could allow arch or target OS version as inputs
		
		// these will eventually be auto-detected
		const version_id = '24.1.0';
		const short_sha = '9d7789a3ac';
		
		let suffix;
		const osType = process.env['RUNNER_OS'];
		if (osType === 'Linux') {
			suffix = 'Linux-Ubuntu22.04-x86_64.tar.gz'
		} else if (osType === 'macOS') {
			suffix = 'Darwin-macOS12.1-x86_64.tar.gz'
		} else { // osType === 'Windows'
			suffix = 'Windows-x86_64.zip'
		}

		// leave gracefully if something is wrong
		const url = `https://github.com/NREL/EnergyPlus/releases/download/${tag}/EnergyPlus-${version_id}-${short_sha}-${suffix}`;
		if (url.trim() === "") {
			core.setFailed("Failed to find a URL.");
			return;
		}
		console.log(`URL found: ${url}`);echo "${{ steps.eplus.outputs.energyplus_path }}" >> $GITHUB_PATH

		// need to generate this dynamically of course
		const extractPath = path.join(process.env.RUNNER_TEMP, 'eplus');

		// make the target save directory
		fs.mkdirSync(extractPath, { recursive: true });

		// grab the content
		const archivePath = await tc.downloadTool(url);
		console.log("Download completed.");

		// now we need to extract the downloaded archive -- more dynamic of course
		if (osType === 'Linux' || osType === 'macOS') {
			await tar.x({file: archivePath, cwd: extractPath});
		} else { // windows
			await extract(archivePath, {dir: extractPath})
		}	

		// find the single subdirectory inside the extracted E+ package
		const files = fs.readdirSync(extractPath);
		const subdirectory = files.find(file => fs.statSync(path.join(extractPath, file)).isDirectory());
		if (!subdirectory) {
		  throw new Error('No subdirectory found in the extracted files.');
		}
		const subdirectoryPath = path.join(extractPath, subdirectory);

		console.log("Assigning energyplus_path as: ", subdirectoryPath);

		// set the extracted path as an output
		core.setOutput("energyplus_path", subdirectoryPath);
	} catch (error) {
		core.setFailed(error.message);
	}
}

main();
