// In-page cache of the user's options
const options = {};
const optionsForm = document.getElementById("optionsForm");

// default settings
var defaultSettings = {
    enabled: true,
    floatingButtons: true,
    whiteBackground: false,
    blackText: false,
    boldText: true,
    bottomMargin: "25%",
    edgeMargin: "28px",
    buttonSize: "60px",
    scrollAmount: "80%"
};
Object.assign(options, defaultSettings);

function updateGlobalEnabled(enabled) {
    options.enabled = enabled;
    if(!options.enabled) {
        // disable all settings
        fbSettings.forEach((setting) => {
            optionsForm[setting].disabled = true;
        });
        toggleStyleSettings.forEach((setting) => {
            optionsForm[setting].disabled = true;
        });
        optionsForm.floatingButtons.disabled = true;
    } else {
        // enable all settings
        fbSettings.forEach((setting) => {
            optionsForm[setting].disabled = false;
        });
        toggleStyleSettings.forEach((setting) => {
            optionsForm[setting].disabled = false;
        });
        optionsForm.floatingButtons.disabled = false;
    }
}

function toggleFloatingButtons(show) {
    options.floatingButtons = show;
    optionsForm.floatingButtons.checked = show;
    if(options.floatingButtons) {
        // show additional settings
        document.getElementById("floatingButtonsSettings").style.display = "block";
    } else {
        // hide additional settings
        document.getElementById("floatingButtonsSettings").style.display = "none";
    }
}

// overall enable toggle
document.getElementById("toggleEnabled").addEventListener("change", (event) => {
    options.enabled = event.target.checked;
    updateGlobalEnabled(options.enabled);
    chrome.storage.sync.set({ options });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "globalToggle", options });
    });
});

// reset default settings
document.getElementById("resetSettings").addEventListener("click", () => {
    Object.assign(options, defaultSettings);
    toggleFloatingButtons(defaultSettings.floatingButtons);
    toggleStyleSettings.forEach((setting) => {
        optionsForm[setting].checked = defaultSettings[setting];
    });
    fbSettings.forEach((setting) => {
        optionsForm[setting].value = defaultSettings[setting];
    });
    // toggle global enabled to refresh settings
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "globalToggle", options });
    });
});

// Listen for changes to the floating action buttons setting
optionsForm.floatingButtons.addEventListener("change", (event) => {
    options.floatingButtons = event.target.checked;
    toggleFloatingButtons(options.floatingButtons);
    chrome.storage.sync.set({ options });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateFloatingButtons", options });
    });
});

// floating action buttons settings
var fbSettings = ["bottomMargin", "edgeMargin", "buttonSize", "scrollAmount"];
fbSettings.forEach((setting) => {
    document.getElementById(setting).addEventListener("input", (event) => {
        var val;
        try {
            val = parseInt(event.target.value);
            if(event.target.value.indexOf("px") > -1) {
                val = val + "px";
            } else if(event.target.value.indexOf("%") > -1) {
                val = val + "%";
            }
        } catch (e) {}

        if(!val) return;
        options[setting] = val;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateFloatingButtons", options });
        });
        chrome.storage.sync.set({ options });
    });
});

// Immediately persist options changes
var toggleStyleSettings = ["blackText", "whiteBackground", "boldText"];
toggleStyleSettings.forEach((setting) => {
    optionsForm[setting].addEventListener("change", (event) => {
        options[setting] = event.target.checked;
        chrome.storage.sync.set({ options });

        // send updateStyle message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateStyle", options });
        });
    });
});

// Initialize the form with the user's option settings
const data = await chrome.storage.sync.get("options");
Object.assign(options, data.options);
document.getElementById("toggleEnabled").checked = options.enabled;
updateGlobalEnabled(options.enabled);
optionsForm.floatingButtons.checked = options.floatingButtons;
toggleStyleSettings.forEach((setting) => {
    optionsForm[setting].checked = options[setting];
});

fbSettings.forEach((setting) => {
    if(options[setting]) {
        optionsForm[setting].value = options[setting] || defaultSettings[setting];
    }
});

if(options.floatingButtons) {
    document.getElementById("floatingButtonsSettings").style.display = "block";
} else {
    document.getElementById("floatingButtonsSettings").style.display = "none";
}
