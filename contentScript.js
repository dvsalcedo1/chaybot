(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, storyId } = obj;

        if (type === "CHECK") {
            // Get elements of the article in the format { 'url': str, 'headline': str, 'subhead': str, 'body': str }
            var story = {};
            story['headline'] = document.getElementsByClassName("wp-block wp-block-post-title block-editor-block-list__block editor-post-title editor-post-title__input rich-text")[0].textContent;
            
            var body = '';
            const bodyElement = document.getElementsByClassName("wp-block-paragraph");
            for (i=0;i<bodyElement.length;i++) {body += bodyElement[i].textContent}; 
            story['body'] = body;
            
            response(story);
        }
    });
})();