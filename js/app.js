document.addEventListener("DOMContentLoaded", function () {
    // List of markdown files in the "content" folder
    const markdownFiles = ['content/post1.md', 'content/post2.md', 'content/post3.md'];

    // Initialize the search index
    let idx = lunr(function () {
        this.field('title');
        this.field('content');
        this.ref('file');
    });

    let posts = {};

    // Fetch and index each markdown file
    markdownFiles.forEach(file => {
        fetch(file)
            .then(response => response.text())
            .then(text => {
                const lines = text.split('\n');
                const title = lines[0].replace('# ', ''); // Assuming the first line is the title
                const content = lines.slice(1).join(' ');
                
                // Add to the search index
                idx.add({
                    title: title,
                    content: content,
                    file: file
                });

                // Store the post content
                posts[file] = {
                    title: title,
                    content: text
                };
            });
    });

    // Function to display a markdown file
    function displayContent(file) {
        const content = posts[file].content;
        const htmlContent = marked(content);
        document.getElementById('content-display').innerHTML = htmlContent;
    }

    // Function to perform search
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
    }
});
