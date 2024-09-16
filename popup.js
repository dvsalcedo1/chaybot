import { getActiveTabURL } from "./utils.js"

// Initialize the chrome extension
document.addEventListener("DOMContentLoaded", async() => {
    const activeTab = await getActiveTabURL();

    if (activeTab.url.includes("rappler.com/wp-admin/post.php")) {
        // Initialize tabs
        await $('ul.tabs').tabs();

        // Create buttons for runtests
        const runTestsElement = document.getElementsByClassName("new badge blue")[0];
        await runTestsElement.addEventListener("click", onCheck);
    } else {
        const container = document.getElementsByClassName("row noMargin noPadding")[0];
        container.innerHTML = '<div class="title">This is not a valid story page.</div>';
    }

});

// Runtests button
const onCheck = async e => {
    const activeTab = await getActiveTabURL();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "CHECK"
    }, runTests)
};

// Run Tests Function
const runTests = async (story) => {
    // Call on the chaybot-flask api to process the tests
    const flaskRes = await fetch("http://127.0.0.1:5000/basictests", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(story),
    });
    const flaskData = await flaskRes.json();

    // Create the summary display of all tests
    const flaskSummaryPassedElement = document.createElement("a");
    flaskSummaryPassedElement.id = "summary-passed"
    flaskSummaryPassedElement.classList = "blue-text collection-item";
    flaskSummaryPassedElement.target = "_blank";
    flaskSummaryPassedElement.innerHTML = 'Tests Passed ' + '<span class="new badge blue" data-badge-caption="'+ flaskData.summary.tests_passed +'"><span></span>';

    const flaskSummaryFailedElement = document.createElement("a");
    flaskSummaryFailedElement.id = "summary-failed"
    flaskSummaryFailedElement.classList = "blue-text collection-item";
    flaskSummaryFailedElement.target = "_blank";
    flaskSummaryFailedElement.innerHTML = 'Tests Failed ' + '<span class="new badge blue" data-badge-caption="'+ flaskData.summary.tests_failed +'"><span></span>';

    const container = await document.getElementById("resultsTab");
    container.innerHTML = '';
    container.appendChild(flaskSummaryPassedElement);
    container.appendChild(flaskSummaryFailedElement);

    // Create one block for each test
    for (let i = 0; i < flaskData.details.length; i++) {
        const flaskTestElement = document.createElement("a");
        flaskTestElement.id = flaskData.details[i].ruleCode;
        flaskTestElement.classList = "blue-text collection-item";
        flaskTestElement.target = "_blank";
        flaskTestElement.innerHTML = flaskData.details[i].ruleCode + '<br>'+ flaskData.details[i].resultDesc + ' <span class="new badge blue" data-badge-caption="'+ flaskData.details[i].ruleResult +'"><span></span>';
        container.appendChild(flaskTestElement);
    }

};