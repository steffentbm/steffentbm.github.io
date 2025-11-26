document.addEventListener('DOMContentLoaded', () => {
    const postsListContainer = document.getElementById('posts-list');
    const postViewContainer = document.getElementById('post-view');
    const homeLink = document.getElementById('home-link');
    const themeToggle = document.getElementById('theme-toggle');

    // Theme Logic
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Routing Logic (Simple State)
    const showList = () => {
        postsListContainer.classList.remove('hidden');
        postViewContainer.classList.add('hidden');
        postViewContainer.innerHTML = ''; // Clear content
        window.scrollTo(0, 0);
    };

    const showPost = async (post) => {
        postsListContainer.classList.add('hidden');
        postViewContainer.classList.remove('hidden');
        
        // Loading state
        postViewContainer.innerHTML = '<p>Loading...</p>';

        try {
            const response = await fetch(`posts/${post.file}`);
            if (!response.ok) throw new Error('Post not found');
            const htmlContent = await response.text();

            postViewContainer.innerHTML = `
                <a href="#" class="back-button">← Back to posts</a>
                <div class="post-content">
                    <header class="post-header">
                        <span class="post-date">${formatDate(post.date)}</span>
                        <h1>${post.title}</h1>
                    </header>
                    <div class="post-body">
                        ${htmlContent}
                    </div>
                </div>
            `;

            // Re-attach back button listener
            postViewContainer.querySelector('.back-button').addEventListener('click', (e) => {
                e.preventDefault();
                showList();
            });

            window.scrollTo(0, 0);

        } catch (error) {
            postViewContainer.innerHTML = `<p>Error loading post: ${error.message}</p><a href="#" class="back-button">← Back</a>`;
            postViewContainer.querySelector('.back-button').addEventListener('click', (e) => {
                e.preventDefault();
                showList();
            });
        }
    };

    // Helper: Format Date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Fetch and Render Posts
    const loadPosts = async () => {
        try {
            const response = await fetch('posts/posts.json');
            if (!response.ok) throw new Error('Failed to load posts manifest');
            const posts = await response.json();

            // Sort posts by date (newest first)
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));

            postsListContainer.innerHTML = posts.map(post => `
                <article class="post-card" data-id="${post.id}">
                    <span class="post-date">${formatDate(post.date)}</span>
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt}</p>
                </article>
            `).join('');

            // Add click listeners to cards
            document.querySelectorAll('.post-card').forEach(card => {
                card.addEventListener('click', () => {
                    const postId = card.getAttribute('data-id');
                    const post = posts.find(p => p.id === postId);
                    if (post) showPost(post);
                });
            });

        } catch (error) {
            postsListContainer.innerHTML = `<p>Error loading posts: ${error.message}</p>`;
        }
    };

    // Initialize
    loadPosts();

    // Home Link
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showList();
    });
});
