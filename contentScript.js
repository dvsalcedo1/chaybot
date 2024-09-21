(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, storyId } = obj;

        if (type === "CHECK") {
            // Get elements of the article in the format { 'url': str, 'headline': str, 'subhead': str, 'body': str }
            var story = {};

            // URL
            try {
                story['url'] = document.getElementsByClassName('components-button edit-post-post-url__toggle is-tertiary')[0].textContent;
            } catch(err) {
                if (err instanceof TypeError) {
                    story['url'] = '';
                } else {
                    throw err;
                }
            }
            
            // Headline
            story['headline'] = document.getElementsByClassName("wp-block wp-block-post-title block-editor-block-list__block editor-post-title editor-post-title__input rich-text")[0].textContent;
            
            // Subhead
            try {
                story['subhead'] = document.getElementsByClassName('components-textarea-control__input css-y67plw e1w5nnrk0')[0].textContent
            } catch(err) {
                if (err instanceof TypeError) {
                    story['subhead'] = '';
                } else {
                    throw err;
                }                
            }

            // Body
            var body = '';
            const bodyElement = document.getElementsByClassName("wp-block-paragraph");
            for (i=0;i<bodyElement.length;i++) {body += bodyElement[i].textContent}; 
            story['body'] = body;
            
            response(story);
        }
    });
})();