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
    const flaskRes = await fetch("http://35.226.17.69:5000/basictests", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(story),
    });
    const flaskData = await flaskRes.json();

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

    // Create one block for each test
    for (let i = 0; i < flaskData.details.length; i++) {
        if (flaskData.details[i].ruleResult == "FAIL") {
            const flaskTestElement = createBlock('div','row');
            const flaskTestElementContainer = createBlock('div', 'col s12 m6');

            const flaskTestCard = createBlock('div','card blue darken-1')
            const flaskTestCardTitle = createBlock('div','card-content white-text','<span class="card-title">'+flaskData.details[i].ruleCode+'</span><p>'+flaskData.details[i].resultDesc+'</p>');
            const flaskTestCardResult = createBlock('div','card-action white-text','FAIL');

            flaskTestCard.appendChild(flaskTestCardTitle);
            flaskTestCard.appendChild(flaskTestCardResult);
            flaskTestElementContainer.appendChild(flaskTestCard);
            flaskTestElement.appendChild(flaskTestCard);
            container.appendChild(flaskTestElement);
        }
    };
};