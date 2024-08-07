const {exec} = require('child_process');
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
        const repo = core.getInput('repository');
        // const os_version_override = core.getInput('os_version_override');

        // determine some platform specific stuff, might get generalized later
        let platform = 'INVALID_PLATFORM';
        let extension = 'INVALID_EXTENSION';
        let os = 'INVALID_OS';
        let sHardened = '';
        let overrideFlag = false; //os_version_override !== 0;
        const osType = process.env['RUNNER_OS'];
        if (osType === 'Linux') {
            platform = 'Linux';
            os = overrideFlag ? '-Ubuntu' + os_version_override : '-Ubuntu22.04';
            extension = '.tar.gz';
            if (hardened) {
				core.warning("Ignored hardened attribute for Ubuntu builds");
			}
        } else if (osType === 'macOS') {
            platform = 'Darwin';
            os = overrideFlag ? '-macOS' + os_version_override : '-macOS12.1';
            extension = '.tar.gz';
            if (hardened) {
				core.warning("Ignored hardened attribute for Mac builds");
			}
        } else { // osType === 'Windows'
            platform = 'Windows';
            os = ''
            extension = '.zip';
            if (hardened) {
				sHardened = '-HardenedRuntime';
			}
        }

        // determine architecture name
        let arch = 'INVALID_ARCH';
        const archType = process.env['RUNNER_ARCH'];
        if (archType === 'X86') {
            arch = '-i386';
        } else if (archType === 'X64') {
            arch = '-x86_64';
        } else if (archType === 'ARM' || archType === 'ARM64') {
            arch = '-arm64';
        }

        // and now calculate a suffix to search for in the release assets
        const suffix = `${platform}${os}${arch}${extension}`;
        console.log(`Going to search for asssets that match this pattern: ${suffix}`);

        // find the correct release asset
        const releaseUrl = `https://api.github.com/repos/${repo}/releases/tags/${tag}`;
        console.log(`Gathering release information from release url: ${releaseUrl}`);
        const response = await fetch(releaseUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${process.env.GITHUB_TOKEN}`
            }
        });
        const data = await response.json();
        let assetUrl = null;
        data.assets.forEach(item => {
			console.log(`Checking if ${item.name} includes ${suffix}`);
            if (assetUrl === null && item.name.includes(suffix)) {
                assetUrl = item.browser_download_url;
                console.log(`URL found: ${assetUrl}`);
            }
        });
    
        // grab the content
        console.log(`About to download url: ${assetUrl}`);
        const archivePath = await tc.downloadTool(assetUrl);
        console.log("Download completed.");

        // now we need to extract the downloaded archive
        const extractPath = path.join(process.env.RUNNER_TEMP, 'eplus');
        fs.mkdirSync(extractPath, {
            recursive: true
        });
        if (osType === 'Linux' || osType === 'macOS') {
            await tar.x({
                file: archivePath,
                cwd: extractPath
            });
        } else { // windows
            await extract(archivePath, {
                dir: extractPath
            })
        }

        // find the single subdirectory inside the extracted E+ package
        const files = fs.readdirSync(extractPath);
        const subdirectory = files.find(file => fs.statSync(path.join(extractPath, file)).isDirectory());
        if (!subdirectory) {
            throw new Error('No subdirectory found in the extracted files.');
        }
        const subdirectoryPath = path.join(extractPath, subdirectory);

        // helpful debug messages
        console.log("Assigning energyplus_path as: ", subdirectoryPath);
        let eplusExe = path.join(subdirectoryPath, 'energyplus');
        if (osType === 'Windows') {
            eplusExe = eplusExe + '.exe';
        }
        exec(`${eplusExe} --version`, (error, stdout, stderr) => {
            console.log(stdout);
        });

        // set the extracted path as an output
        core.setOutput("energyplus_directory", subdirectoryPath);

    } catch (error) {

        core.setFailed(error.message);

    }
}

main();
