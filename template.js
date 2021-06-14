// ****
(async () => {
// ****

// ********************************************************
// JSZip
/* {LIB_JSZIP} */
// ********************************************************

// ********************************************************
// FileSaver
/* {LIB_FILESAVER} */
// ********************************************************

/* {FILE_SUFFIX} */

/* {URL_LIST} */

/* {MODIFY_NAME} */

const zip = new JSZip();

for (let i = 0; i < urls.length; i++) {
  console.log(`Fetching ${i + 1}/${urls.length}`);
  const url = urls[i];

  const prefix = ((i + 1) + '').padStart(Math.ceil(Math.log10(urls.length)), '0');
  const name = typeof MODIFY_NAME === 'function' 
    ? MODIFY_NAME(url, i, urls.length) 
    : `${prefix}${typeof FILE_SUFFIX === 'string' ? FILE_SUFFIX : ''}`;

  try {
    const request = fetch(url);
    const data = new Uint8Array((await (await request).arrayBuffer()));
  
    zip.file(name, data);
  
    // Delay
    await new Promise(r => setTimeout(r, /* {REQUEST_INTERVAL} */));
  } catch (e) {
    console.log(`Error fetching ${i + 1}/${urls.length} ${url}`);
  }
}

console.log('Generating zip...')
zip.generateAsync({ type: 'blob' })
  .then(blob => {
    console.log('Downloading...')
    saveAs(blob, "/* {ZIP_FILENAME} */")
  });


// ****
})();
// ****