import packageJson from "../../package.json" with { type: "json" };

const configuredVersion = packageJson.dependencies["@zengrid/core"];
const semver = /^(\d+)\.(\d+)\.(\d+)$/.exec(configuredVersion);

if (!semver) {
  throw new Error("@zengrid/core must use an exact semantic version in package.json.");
}

export const coreVersion = configuredVersion;
export const coreVersionLabel = `v${coreVersion}`;
export const currentDocsVersionLabel = `${coreVersionLabel} (Latest)`;
