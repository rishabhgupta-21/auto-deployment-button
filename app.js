// Variables
const deployButton = document.querySelector("#deployButton");
const selectFolderInput = document.querySelector("#selectFolder");
const projectNameInput = document.querySelector("#projectName");
const authToken = document.querySelector("#authToken");

let validFilesCount = 0;
let parentFolder = "";
let selectedFiles = [];     // needed for (length === 0) condition
let filesParam = [];

// Reset State
const reset = () => {
    // Empty all input fields of any values
    selectFolderInput.value = ""
    projectNameInput.value = ""
    authToken.value = ""
    // Remove styling from inputs and disable deploy button
    deployButton.classList.add("disabled");
    projectNameInput.classList.add("notFilled");
    authToken.classList.add("notFilled");

    // reset global variables
    validFilesCount = 0
    parentFolder = ""
    selectedFiles = []
    filesParam = []
}

// Start with resetting
reset();

// Store and Validate files
selectFolderInput.addEventListener("change", async (event) => {
    // Storing all selected files in a variable as a 'filesList'
    selectedFiles = event.target.files;

    // Number of valid files for each CHANGE EVENT
    let numValid = 0;

    for (let currFile of selectedFiles) {
        let filePropertiesObject = {};

        const path = currFile.webkitRelativePath;
        parentFolder = path.split("/")[0];

        // Validity check
        if (path.includes(".git"))
            continue;

        try {
            // Store source code in variable
            const content = await currFile.text();

            // Increment Count of Valid Files
            numValid++;

            // Create the Object that contains each file's info
            filePropertiesObject["data"] = content;
            filePropertiesObject["file"] = path;

            // Push it to the filesParam array
            filesParam.push(filePropertiesObject);
        }
        catch (err) {
            // Display Error Message
            alert("An error was encountered.\n", err);
            alert("Check your connection or try again after a few minutes.");

            // Reset everything
            reset();
        }
    }

    // Update global validFilesCount
    validFilesCount = numValid;

    // Checking for Enabling of Deploy Button
    if (validFilesCount === 0 || projectNameInput.value.trim() === "" || authToken.value.trim() === "")
        deployButton.classList.add("disabled");
    else
        deployButton.classList.remove("disabled");
});

// Change the Styling of Deploy button when Input is filled
projectNameInput.addEventListener("keyup", () => {
    if (projectNameInput.value.trim() === "") {
        deployButton.classList.add("disabled");
        projectNameInput.classList.add("notFilled");
    }
    else if (validFilesCount === 0 || authToken.value.trim() === "") {
        deployButton.classList.add("disabled");
        projectNameInput.classList.remove("notFilled");
    }
    else {
        deployButton.classList.remove("disabled");
        projectNameInput.classList.remove("notFilled");
    }
});

// Change the Styling of Deploy button when Auth Token is filled
authToken.addEventListener('keyup', () => {
    if (authToken.value.trim() === '') {
        deployButton.classList.add('disabled');
        authToken.classList.add("notFilled");
    }
    else if (validFilesCount === 0 || projectNameInput.value.trim() === "") {
        deployButton.classList.add("disabled");
        authToken.classList.remove("notFilled");
    }
    else {
        deployButton.classList.remove("disabled");
        authToken.classList.remove("notFilled");
    }
})

// Clicking Deploy button sends a post request
deployButton.addEventListener("click", async () => {
    // Do not do anything if deploy button is disabled
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
        }
    }

    const header = {
        Authorization: `Bearer ${authToken.value}`,
        "Content-Type": "application/json",
    }

    // Send a POST Request
    try {
        const response = await fetch("https://api.vercel.com/v13/deployments", {
            body: JSON.stringify(body),
            headers: header,
            method: "post",
        });

        console.log(await response.json());

        if (response.status === 200) {
            alert(`'${projectNameInput.value}' has been successfully deployed on Vercel!`)
            reset();
        }
    }
    catch (err) {
        console.error(err);
        // Display Error Message
        alert("An error was encountered while trying to deploy your project\n", err);
        alert("Check your connection or try again after a few minutes.");
    }
});
