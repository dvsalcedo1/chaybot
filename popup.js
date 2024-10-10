import { getActiveTabURL } from "./utils.js"

// Initialize the chrome extension
document.addEventListener("DOMContentLoaded", async() => {
    const activeTab = await getActiveTabURL();

    if (activeTab.url.includes("rappler.com/wp-admin/post.php")) {
        // Initialize tabs
        await $(document).ready(function(){
            $('.tabs').tabs();
        });

        // Create function for runtests
        const runTestsElement = document.getElementById("runTests");
        await runTestsElement.addEventListener("click", onCheck);

        // Create function for save story
        const saveTestsElement = document.getElementById("saveStory");
        await saveTestsElement.addEventListener("click", onSave);
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

const onSave = async e => {
    const activeTab = await getActiveTabURL();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "CHECK"
    },
    async (story) => {
        const jsonLogs = await JSON.stringify(story, null, 2);
        const logBlob = new Blob([jsonLogs], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(logBlob);
        link.download = story['url']+'.json';
        link.click();
        URL.revokeObjectURL(link.href);
    });
};

// Run Tests Function
const runTests = async (story) => {
    // Call on the chaybot-flask api to process the tests
    const flaskRes = await fetch("http://34.121.213.215:5000/basictests", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(story),
    });
    const flaskData = await flaskRes.json();

    // Initialize collapsibles
    await $(document).ready(function(){
        $('.collapsible').collapsible();
    });

    function createBlock(typ='div', className='',innerHTML='') {
        const blk = document.createElement(typ);
        blk.className = className;
        blk.innerHTML = innerHTML;
        return blk;
    }

    // Create the summary display of all tests
    const flaskSummaryElement = createBlock('div','row');
    const flaskSummaryPassedElement = createBlock('span','col s6 green badge white-text','Tests Passed: '+flaskData.summary.tests_passed);
    const flaskSummaryFailedElement = createBlock('span','col s6 red badge white-text','Tests Failed: '+flaskData.summary.tests_failed);

    const container = await document.getElementById("resultsTab");
    container.innerHTML = '';

    flaskSummaryElement.appendChild(flaskSummaryPassedElement);
    flaskSummaryElement.appendChild(flaskSummaryFailedElement);
    container.appendChild(flaskSummaryElement);

    const flaskTestsElement = createBlock('ul','collapsible')
    // Create one block for each test
    for (let i = 0; i < flaskData.details.length; i++) {
        if (flaskData.details[i].ruleResult == "FAIL") {

            const flaskTestElement = createBlock('li','');
            flaskTestElement.appendChild(createBlock('div','collapsible-header red lighten-2 white-text','FAIL: '+flaskData.details[i].resultDesc));

            const collapsibleBodyElement = createBlock('div','collapsible-body','<p>Rule Code: '+flaskData.details[i].ruleCode+'</p><p>Offending Strings: </p>');
            collapsibleBodyElement.style = "padding-left: 1rem; padding-right: 1rem; padding-top: 1rem; padding-bottom: 1rem;"
            const offendingStringsElement = createBlock('ol','');
            for (let j = 0; j < flaskData.details[i].offendingStrings.length; j++) {
                offendingStringsElement.appendChild(createBlock('li','',flaskData.details[i].offendingStrings[j]))
            };
            collapsibleBodyElement.appendChild(offendingStringsElement)
            flaskTestElement.appendChild(collapsibleBodyElement);

            flaskTestsElement.appendChild(flaskTestElement);
        }
    };


    container.appendChild(flaskTestsElement);
};