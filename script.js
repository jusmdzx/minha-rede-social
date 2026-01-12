// Desenvolvido por Jonathan Reis

// Carrega tudo ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    checkUser();
    loadTheme(); // Carrega o tema salvo (Escuro ou Claro)
});

// --- LÓGICA DO DARK MODE ---
function toggleTheme() {
    const body = document.body;
    const btnIcon = document.querySelector('#theme-btn-icon i');
    
    // Troca a classe (liga/desliga)
    body.classList.toggle('dark-mode');
    
    // Verifica se ficou escuro ou claro para salvar
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        btnIcon.classList.remove('fa-moon');
        btnIcon.classList.add('fa-sun'); // Vira sol
    } else {
        localStorage.setItem('theme', 'light');
        btnIcon.classList.remove('fa-sun');
        btnIcon.classList.add('fa-moon'); // Vira lua
    }
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    const btnIcon = document.querySelector('#theme-btn-icon i');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if(btnIcon) {
            btnIcon.classList.remove('fa-moon');
            btnIcon.classList.add('fa-sun');
        }
    }
}
// ---------------------------

// Verifica se tem alguém logado
function checkUser() {
    const usuarioAtivo = localStorage.getItem('usuarioAtivo');
    const inputUsername = document.getElementById('username');

    if (usuarioAtivo && inputUsername) {
        inputUsername.value = usuarioAtivo;
        inputUsername.readOnly = true; 
        inputUsername.style.cursor = 'not-allowed'; // Ícone de bloqueado
    }
}

function updateFileName() {
    const input = document.getElementById('postImage');
    const fileNameSpan = document.getElementById('file-name');
    if (input.files && input.files.length > 0) {
        fileNameSpan.textContent = input.files[0].name;
    } else {
        fileNameSpan.textContent = '';
    }
}

function addPost() {
    let username = document.getElementById('username').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const imageInput = document.getElementById('postImage');

    if (!username) {
        username = localStorage.getItem('usuarioAtivo');
    }

    if (!username) {
        alert('Erro: Usuário não identificado. Faça login novamente.');
        window.location.href = 'index.html';
        return;
    }

    if (!content && imageInput.files.length === 0) {
        alert('Escreva algo ou adicione uma foto!');
        return;
    }

    const newPost = {
        id: Date.now(),
        username: username,
        content: content,
        image: null,
        likes: 0,
        liked: false,
        timestamp: new Date().toLocaleString('pt-BR')
    };

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newPost.image = e.target.result;
            savePostToStorage(newPost);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        savePostToStorage(newPost);
    }
}

function savePostToStorage(post) {
    let posts = JSON.parse(localStorage.getItem('socialPosts')) || [];
    posts.unshift(post);
    localStorage.setItem('socialPosts', JSON.stringify(posts));
    
    document.getElementById('postContent').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('file-name').textContent = '';
    
    loadPosts();
}

function loadPosts() {
    const postsContainer = document.getElementById('posts');
    const posts = JSON.parse(localStorage.getItem('socialPosts')) || [];
    
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const heartColor = post.liked ? '#e0245e' : 'var(--text-secondary)'; // Usa variável agora
        const heartIcon = post.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

        const usuarioAtual = localStorage.getItem('usuarioAtivo');
        const podeDeletar = post.username === usuarioAtual;
        
        const deleteButtonHTML = podeDeletar 
            ? `<button class="delete-btn" onclick="deletePost(${post.id})"><i class="fa-solid fa-trash"></i></button>`
            : '';

        postElement.innerHTML = `
            <div class="post-header-row">
                <div class="post-user-name">${post.username}</div>
                ${deleteButtonHTML}
            </div>
            
            <div class="timestamp">${post.timestamp}</div>
            
            <div class="content">${post.content}</div>
            
            ${post.image ? `<img src="${post.image}" alt="Imagem do post">` : ''}
            
            <div class="actions">
                <button onclick="toggleLike(${post.id})" style="color: ${heartColor}">
                    <i class="${heartIcon}"></i> ${post.likes}
                </button>
                <span><i class="fa-regular fa-comment"></i></span>
                <span><i class="fa-solid fa-share"></i></span>
            </div>
        `;

        postsContainer.appendChild(postElement);
    });
}

function toggleLike(id) {
    let posts = JSON.parse(localStorage.getItem('socialPosts')) || [];
    const index = posts.findIndex(p => p.id === id);

    if (index !== -1) {
        if (posts[index].liked) {
            posts[index].likes--;
            posts[index].liked = false;
        } else {
            posts[index].likes++;
            posts[index].liked = true;
        }
        localStorage.setItem('socialPosts', JSON.stringify(posts));
        loadPosts();
    }
}

function deletePost(id) {
    if (confirm("Tem certeza que deseja apagar este post?")) {
        let posts = JSON.parse(localStorage.getItem('socialPosts')) || [];
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('socialPosts', JSON.stringify(posts));
        loadPosts();
    }
}