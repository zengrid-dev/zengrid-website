import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEFAULT_SITEMAP_PATH = path.resolve(process.cwd(), 'dist', 'sitemap-0.xml');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const KEY_FILE_PATTERN = /^[A-Za-z0-9-]{8,128}\.txt$/;
const MAX_URLS_PER_BATCH = 10_000;

function parseArgs(argv) {
  const options = {
    dryRun: false,
    sitemapPath: DEFAULT_SITEMAP_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--sitemap') {
      options.sitemapPath = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }
  }

  return options;
}

async function getIndexNowKeyFile() {
  const files = await readdir(PUBLIC_DIR);
  const keyFileName = files.find((file) => KEY_FILE_PATTERN.test(file));

  if (!keyFileName) {
    throw new Error('No IndexNow key file was found in public/.');
  }

  const key = await readFile(path.join(PUBLIC_DIR, keyFileName), 'utf8');
  const normalizedKey = key.trim();
  const basename = keyFileName.replace(/\.txt$/, '');

  if (normalizedKey !== basename) {
    throw new Error(`IndexNow key file ${keyFileName} does not match its file contents.`);
  }

  return {
    key: normalizedKey,
    keyPath: `/${keyFileName}`,
  };
}

async function getUrlsFromSitemap(sitemapPath) {
  const xml = await readFile(sitemapPath, 'utf8');
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];

  if (matches.length === 0) {
    throw new Error(`No URLs were found in ${sitemapPath}.`);
  }

  return matches.map((match) => match[1]);
}

function chunkUrls(urls) {
  const chunks = [];

  for (let index = 0; index < urls.length; index += MAX_URLS_PER_BATCH) {
    chunks.push(urls.slice(index, index + MAX_URLS_PER_BATCH));
  }

  return chunks;
}

async function submitBatch({ host, key, keyLocation, urlList, dryRun }) {
  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  if (dryRun) {
    console.log(`Dry run: would submit ${urlList.length} URLs to ${INDEXNOW_ENDPOINT}`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`IndexNow submission failed: ${response.status} ${response.statusText}\n${responseText}`);
  }

  console.log(`Submitted ${urlList.length} URLs to IndexNow.`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const urls = await getUrlsFromSitemap(options.sitemapPath);
  const { key, keyPath } = await getIndexNowKeyFile();
  const hostUrl = new URL(urls[0]);
  const host = hostUrl.host;
  const keyLocation = `${hostUrl.origin}${keyPath}`;
  const batches = chunkUrls(urls);

  for (const batch of batches) {
    await submitBatch({
      host,
      key,
      keyLocation,
      urlList: batch,
      dryRun: options.dryRun,
    });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
