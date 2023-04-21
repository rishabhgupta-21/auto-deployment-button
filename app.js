// NOTE: the 'files' fileList will always be sorted alphabetically

// Variables
const deployButton = document.querySelector("#deployButton");
const selectFolderInput = document.querySelector("#selectFolder");
const projectNameInput = document.querySelector("#projectName");

const authToken = "unVJjxDenHIAwMmZ7nHvD0Lp";
let validFilesCount = 0;
let selectedFiles = []; // needed for (length === 0) condition
let filesParam = [];
let parentFolder = "";

// Disable deploy button and Project name input is empty
deployButton.classList.add("disabled");
projectNameInput.classList.add("notFilled");

// Store and Validate files
selectFolderInput.addEventListener("change", async (event) => {
  // Storing all selected files in a variable as a 'filesList'
  selectedFiles = event.target.files;

  // Number of valid files for each CHANGE EVENT
  let numValid = 0;

  for (let currFile of selectedFiles) {
    // let inlinedFileObject = {};
    let filePropertiesObject = {};

    const path = currFile.webkitRelativePath;
    parentFolder = path.split("/")[0];

    // Validity check
    if (path.includes(".git")) continue;

    try {
      const content = await currFile.text();

      // Increment Count of Valid Files
      numValid++;

      // Create the Object that contains each file's info
      filePropertiesObject["data"] = content;
      filePropertiesObject["file"] = path;
      // filePropertiesObject["encoding"] = "utf-8";

      // Create the Object which will be an element of filesParam
      // inlinedFileObject["UploadedFile"] = filePropertiesObject;

      // Push it to the filesParam array
      // This will be a parameter in the fetch request to Vercel's servers
      filesParam.push(filePropertiesObject);
    } catch (err) {
      // Display Error Message
      alert("An error was encountered.\n", err);
      alert("Check your connection or try again after a few minutes.");

      // Replay program - clean existing filesParam
      selectedFiles = [];
      filesParam = [];
      validFilesCount = 0;
      selectFolderInput.value = "";
      return;
    }
  }

  // Update global validFilesCount
  validFilesCount = numValid;

  // Checking for Enabling of Deploy Button
  if (validFilesCount === 0 || projectNameInput.value.trim() === "")
    deployButton.classList.add("disabled");
  else deployButton.classList.remove("disabled");
});

// Change the Styling of button when Input is filled
projectNameInput.addEventListener("keyup", () => {
  if (projectNameInput.value.trim() === "") {
    deployButton.classList.add("disabled");
    projectNameInput.classList.add("notFilled");
  } else if (validFilesCount === 0) {
    deployButton.classList.add("disabled");

    if (projectNameInput.value.trim() === "")
      projectNameInput.classList.add("notFilled");
    else projectNameInput.classList.remove("notFilled");
  } else {
    deployButton.classList.remove("disabled");
    projectNameInput.classList.remove("notFilled");
  }
});

// Clicking Deploy button sends a post request
deployButton.addEventListener("click", async () => {
  if (deployButton.classList.contains("disabled")) {
    return;
  }

  // Configuration Information
  const body = {
    name: projectNameInput.value.trim(),
    files: filesParam,
    projectSettings: {
      devCommand: null,
      installCommand: null,
      buildCommand: null,
      outputDirectory: parentFolder,
      rootDirectory: null,
      framework: null,
    },
  };

  const header = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  // Send a POST Request
  try {
    console.log({
      body: JSON.stringify(body),
      headers: header,
      method: "post",
    });
    const response = await fetch("https://api.vercel.com/v13/deployments", {
      body: JSON.stringify(body),
      headers: header,
      method: "post",
    });

    console.log(await response.json());
  } catch (err) {
    console.error(err);
    // Display Error Message
    alert(
      "An error was encountered while trying to deploy your project\n",
      err
    );
    alert("Check your connection or try again after a few minutes.");
  }
});
