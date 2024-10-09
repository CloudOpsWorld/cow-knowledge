document.addEventListener("DOMContentLoaded", function () {
    // Fetch the list of markdown files (replace with API call if possible)
    fetch('content/files.json')
        .then(response => response.json())
        .then(files => {
            initializeSearch(files);
        });

    function initializeSearch(files) {
        let idx = lunr(function () {
            this.field('title');
            this.field('content');
            this.ref('file');
        });

        let posts = {};

        // Fetch each markdown file and add to the search index
        files.forEach(file => {
            fetch(`content/${file}`)
                .then(response => response.text())
                .then(text => {
                    const lines = text.split('\n');
                    const title = lines[0].replace('# ', ''); // Assuming first line is the title
                    const content = lines.slice(1).join(' ');

                    // Add to Lunr.js index
                    idx.add({
                        title: title,
                        content: content,
                        file: file
                    });

                    // Store the post content for rendering later
                    posts[file] = {
                        title: title,
                        content: text
                    };
                });
        });

        // Perform the search when the user types in the search box
        window.performSearch = function () {
            const query = document.getElementById('search-input').value;
            const results = idx.search(query);
            const resultsList = document.getElementById('search-results');
            resultsList.innerHTML = '';

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
        };

        // Function to display the selected markdown file
        function displayContent(file) {
            const content = posts[file].content;
            const htmlContent = marked(content);
            document.getElementById('content-display').innerHTML = htmlContent;
        }
    }
});
