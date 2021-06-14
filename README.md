# har-to-js-download-snippet
This script reads an HAR file for GET requests and prints their URLs into javascript code.
When the code is executed in the browser, it will fetch the URLs, zip each response data and download the generated zip.

## Instructions
Requirements: Git and Node.js
1. Clone the repository:
```bash
git clone https://github.com/g-otn/har-to-js-download-snippet.git
```

2. Move your `.har` file to the repository folder and rename it to `file.json`

3. (Optional) Edit the `index.js` file and modify the options at the beggining of the file
   - If the `FETCH_LIBS` option is set to `true`, install the dependencies by running: `npm i`

4. Run the `index.js` file to generate your snippet:
```bash
node .
```

5. The snippet will be generated at `snippet.js`. You can use it by, for example, pasting the file content into the browser console