import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showNewPostForm);
    document.getElementById('cancelPost').addEventListener('click', hideNewPostForm);
    document.getElementById('submitPost').addEventListener('click', handleSubmitPost);

    // Load initial posts
    await loadPosts();
});

function showNewPostForm() {
    document.getElementById('newPostForm').classList.remove('hidden');
}

function hideNewPostForm() {
    document.getElementById('newPostForm').classList.add('hidden');
    resetForm();
}

function resetForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('authorName').value = '';
    quill.setContents([]);
}

async function handleSubmitPost() {
    const title = document.getElementById('postTitle').value;
    const author = document.getElementById('authorName').value;
    const content = quill.root.innerHTML;

    if (!title || !author || !content) {
        alert('Please fill in all fields');
        return;
    }

    try {
        await backend.createPost(title, content, author);
        hideNewPostForm();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    }
}

async function loadPosts() {
    try {
        const posts = await backend.getPosts();
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const date = new Date(Number(post.timestamp) / 1000000); // Convert nanoseconds to milliseconds
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h2 class="post-title">${post.title}</h2>
            <div class="post-meta">
                By ${post.author} • ${date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </div>
            <div class="post-content">
                ${post.body}
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}
