document.addEventListener('DOMContentLoaded', function(){
    // console.log(document.querySelector('#following'));
    // document.querySelector('#following').addEventListener('click', () => load_posts('following'));

    // load_posts("all");
});

function load_posts(user) {

    document.querySelector('#posts-view').innerHTML =`<h3>${user}</h3>`;

    // Get posts
    fetch(`posts/${user}`)
    .then(response => response.json())
    .then(posts => {
        // Print posts
        console.log(posts);

        posts.forEach(post => {
            // Create div for each post
            const element = document.createElement('div');
            element.className = 'post rounded border';

            // Add data to div
            element.innerHTML = `
                <a href="/${post.user}"><h6>${post.user.charAt(0).toUpperCase() + post.user.slice(1)}</h6></a>
                ${post.message}
                <br>
                <div class="text-muted">${ post.timestamp }</div>
                <button class="like" onclick=like(this)>
                    <span><i class="fa-regular fa-heart heart" style="color:red"></i></span>
                    <span class="counter">0</span>
                </button>
            `;
            
            // Add element to view
            document.querySelector('#posts-view').append(element);
        });
        // document.querySelectorAll('.profile').forEach(p => {
        //     p.addEventListener('click', function() {
        //         load_posts(p.innerHTML);
        //         return false;
        //     })
        // })
    });
}

function like(x) {
    const heart = x.querySelector(".heart");
    let counter = x.querySelector(".counter");
    if (heart.classList.value === "fa-solid fa-heart heart") {
        heart.classList = "fa-regular fa-heart heart";
        counter.innerHTML--;
    } else {
        heart.classList = "fa-solid fa-heart heart";
        counter.innerHTML++;
    }
}

// function loadProfile(username) {
//     const head = document.createElement('h2');
//     head.innerHTML = `@${username}`;
//     const button = document.createElement('button');
//     button.classList = 'btn btn-primary';
//     button.innerHTML = 'Follow';

//     const div = document.querySelector('#profile');
//     div.innerHTML = '';
//     div.append(head);
//     div.append(button);
// }