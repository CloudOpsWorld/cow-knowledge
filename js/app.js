document.addEventListener("DOMContentLoaded", function () {
    const markdownFiles = []; // Assume an array or API fetch lists the files

    fetch('content/files.json')
        .then(response => response.json())
        .then(files => {
            initializeSearch(files);
        })
        .catch(error => {
            console.error('Error loading files.json:', error);
            document.getElementById('content-display').innerHTML = '<p>Error loading content. Please try again later.</p>';
        });

    function initializeSearch(files) {
        let idx = lunr(function () {
            this.field('title');
            this.field('content');
            this.ref('file');
        });

        let posts = {};

        files.forEach(file => {
            fetch(`content/${file}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch file');
                    }
                    return response.text();
                })
                .then(text => {
                    const lines = text.split('\n');
                    const title = sanitizeHTML(lines[0].replace('# ', ''));
                    const content = lines.slice(1).join(' ');

                    idx.add({
                        title: title,
                        content: content,
                        file: file
                    });

                    posts[file] = {
                        title: title,
                        content: text
                    };
                })
                .catch(error => {
                    console.error('Error loading markdown file:', file, error);
                });
        });

        window.performSearch = function () {
            const query = sanitizeHTML(document.getElementById('search-input').value);
            const results = idx.search(query);

            const resultsList = document.getElementById('search-results');
            resultsList.innerHTML = '';

            if (results.length === 0) {
                resultsList.innerHTML = '<li>No articles found.</li>';
            } else {
                results.forEach(result => {
                    const file = result.ref;
                    const postTitle = posts[file].title;

                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = '#';
                    link.textContent = postTitle;
                    link.onclick = function () {
                        displayContent(file);
                        return false;
                    };

                    listItem.appendChild(link);
                    resultsList.appendChild(listItem);
                });
            }
        };

        function displayContent(file) {
            const content = posts[file].content;
            const htmlContent = marked(content);
            document.getElementById('content-display').innerHTML = htmlContent;
        }
    }

    // Sanitize user input to prevent XSS attacks
    function sanitizeHTML(str) {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = str;
        return tempDiv.innerHTML;
    }
});
