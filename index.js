const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `version` and `hardened` inputs defined in action metadata file
  const version = core.getInput('version');
  const hardened = core.getInput('hardened');
  console.log(`Going to use version ${version}; hardened: ${hardened}!`);
  // const time = (new Date()).toTimeString();
  core.setOutput("energyplus_path", "/path/to/eplus");
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
