/**
 * Main function called by the html file
 */
const generator = () => {
  getFiles();
}

/**
 * Get added files and call event "handleFiles"
 */
const getFiles = () => {
  let inputElement = document.getElementById("fileInput");
    inputElement.addEventListener("change", handleFiles, false);
}

/**
 * Fills an array with JSON objects representing the content
 * of the files and merges all the objects in the array
 */
async function handleFiles() {
  try {
    let fileList = this.files;
    let fileArray = [];
    let result = {};
    for await (const file of fileList) {
        const fileContents = await readUploadedFileAsText(file)  
        jsonContent = JSON.parse(fileContents);
        fileArray.push(jsonContent);
    }
    for (let i = 0; i < fileArray.length; i++) {
      result = deepMergeJson(result, fileArray[i]);
    }
    exportToJsonFile(result);
  } catch (error) {
      console.warn(error.message)
  }
}

/**
 * Reads the contents of an uploaded file and returns the result
 * @param {*} inputFile An uploaded file
 * @returns {Promise} String representing the content of inputFile
 */
const readUploadedFileAsText = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsText(inputFile);
  });
};

/*
 * Deep merge two or more objects together.
 * Inspired by (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param {Object} The objects to merge together
 * @returns {Object} Merged values of defaults and options
 */
function deepMergeJson(...file) {
	// Setup merged object
	let newObj = {};
	// Merge the object into the newObj object
	let merge = function (obj) {
		for (let prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				// If property is an object, merge properties
				if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
					newObj[prop] = deepMergeJson(newObj[prop], obj[prop]);
				} else {
					newObj[prop] = obj[prop];
				}
			}
		}
	};
	// Loop through each object and conduct a merge
	for (let i = 0; i < file.length; i++) {
		merge(file[i]);
	}
	return newObj;
};

/**
 * Displays a window to download the json file
 * @param {Object} jsonData The result of the deepMerge of the files
 */
const exportToJsonFile = (jsonData) => {
  let dataStr = JSON.stringify(jsonData);
  let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  let exportFileDefaultName = 'result.json';
  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

generator();