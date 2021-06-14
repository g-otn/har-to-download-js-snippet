// ********************************************************
// Options

// Will fetch and insert library code beforehand, instead of inserting code to fetch it
// Note: if true, you will need to install this script's dependencies by running "npm install"
const FETCH_LIBS = false;

// Name of the final .zip file containing the fetched files
const ZIP_FILENAME = 'download.zip';

// Time in ms between requests
const REQUEST_INTERVAL = 300;

// Suffix to all fetched file names (ex: '.png', '.pdf'). Overriden by MODIFY_NAME
const FILE_SUFFIX = '';

// Regex to Filter URLs that do not match the regex (ex: /this-site\.com/)
const URL_REGEX = /.+/;

// Function that can modify each URL by returning it
let MODIFY_URL = (url, i, size) => {
  return `${url}`;
};
// const MODIFY_URL = null; // Uncomment this line to disable this option

// Function that can modify each file name by returning it
let MODIFY_NAME = (url, i, size) => {
  const prefix = ((i + 1) + '').padStart(Math.ceil(Math.log10(size)), '0'); // Counting with zeros to the left 
  const name = url.replace(/[^A-Za-z0-9_-]/g, '_').substr(0, 150); // Removes uncommon/invalid filename characters and limits to 150 characters
  return `${prefix}_${name}${FILE_SUFFIX}`;
}
// MODIFY_NAME = null; // Uncomment this line to disable this option

// ********************************************************

// Load the renamed HAR file
const har = require('./file.json');
console.log('HAR file loaded with', har.log.entries.length, 'requests');

// Filter and get request URLs
const urls = har.log.entries
  .filter(e => e.request.method === 'GET' && (URL_REGEX ? e.request.url.match(URL_REGEX) : true))
  .map(e => e.request.url);
console.log(urls.length, 'urls found');

// Modify URLs if desired
if (typeof MODIFY_URL === 'function') {
  for (let i = 0; i < urls.length; i++) {
    const modifiedURL = MODIFY_URL(urls[i], i, urls.length);
    if (typeof modifiedURL === 'string') {
      urls[i] = modifiedURL;
    }
  }
  console.log('URLs modified');
}

// Load a copy of template
const fs = require('fs');
const template = fs.readFileSync('./template.js', 'utf-8');
console.log('Template loaded')

// Replace template variables
const buildSnippet = async (snippet) => {
  snippet = snippet.replace('/* {URL_LIST} */', `const urls = JSON.parse(\`\n${JSON.stringify(urls)}\n\`);`);
  if (FETCH_LIBS) {
    console.log('Fetching libs...')
    const fetch = require('node-fetch');
    snippet = snippet.replace('/* {LIB_JSZIP} */', (await (await fetch('https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js')).text()));
    snippet = snippet.replace('/* {LIB_FILESAVER} */', (await (await fetch('https://cdn.jsdelivr.net/npm/file-saver@2/dist/FileSaver.min.js')).text()));
  } else {
    snippet = snippet.replace('/* {LIB_JSZIP} */', `eval(await (await fetch('https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js')).text())`)
    snippet = snippet.replace('/* {LIB_FILESAVER} */', `eval(await (await fetch('https://cdn.jsdelivr.net/npm/file-saver@2/dist/FileSaver.min.js')).text())`);
  }
  if (typeof MODIFY_NAME === 'function') {
    snippet = snippet.replace('/* {MODIFY_NAME} */', `const MODIFY_NAME = ${MODIFY_NAME.toString()}`);
  }
  snippet = snippet.replace('/* {FILE_SUFFIX} */', `const FILE_SUFFIX = '${FILE_SUFFIX}';`);
  snippet = snippet.replace('/* {REQUEST_INTERVAL} */', REQUEST_INTERVAL);
  snippet = snippet.replace('/* {ZIP_FILENAME} */', ZIP_FILENAME);

  return snippet;
}

console.log('Creating snippet from template...')
buildSnippet(template)
  .then(snippet => {
    // Write snippet to file
    console.log('Saving snippet to file...');
    fs.writeFileSync('./snippet.js', snippet);
  })
