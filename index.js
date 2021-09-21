const { Toolkit } = require('actions-toolkit');
const { execSync } = require('child_process');

const fs = require('fs');

if (process.env.PACKAGEJSON_DIR) {
  process.env.GITHUB_WORKSPACE = `${process.env.GITHUB_WORKSPACE}/${process.env.PACKAGEJSON_DIR}`;
  process.chdir(process.env.GITHUB_WORKSPACE);
}

Toolkit.run(async (tools) => {
  const runCommand = async (command) => {
    console.log(`Running command [${command}]`);
    try {
      const result = await execSync(command);
      return result?.toString();
    } catch (error) {
      console.error(`Unable to run [${command}]`, error);
    }
  };

  await tools.runInWorkspace('git', [
    'config',
    'user.name',
    `"${process.env.GITHUB_USER || 'Automated Version Bump'}"`,
  ]);
  await tools.runInWorkspace('git', [
    'config',
    'user.email',
    `"${process.env.GITHUB_EMAIL || 'github-action-npm-module-versioning@users.noreply.github.com'}"`,
  ]);

  const pkg = tools.getPackageJSON();
  const { version } = pkg;
  const tag = `v${version}`;

  console.log(`Current version is ${version} and tag ${tag}`);

  await runCommand(`/usr/local/bin/yarn publish`);
  await runCommand(`git tag -a ${tag} -m "Version ${version}"`);
  await runCommand(`git push origin ${tag}`);
});
