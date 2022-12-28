document.addEventListener('DOMContentLoaded', function(){
    
    // add event to like buttons
    document.querySelectorAll('.like').forEach(b => {
        b.addEventListener('click', () => like(b));
    })

    // add event to edit buttons
    document.querySelectorAll('.edit').forEach(edit => {
        edit.addEventListener('click', () => editPost(edit));
    })

    // Follow button
    const btn = document.querySelector('#follow');
    if (btn) {
        btn.addEventListener('click', () => follow());
    }
});

function follow() {
    fetch('/follow', {
        method: 'PUT',
        headers: {"Content-type": "application/json", "X-CSRFToken": getCookie("csrftoken")},
        body: JSON.stringify({
            username: document.querySelector('#name').innerHTML.slice(1)
        })
    })
    .then(() => {
        const count = document.querySelector('#followers')
        const element = document.querySelector('#follow');
        if (element.innerHTML === 'Follow') {
            count.innerHTML++;
            element.innerHTML = 'Unfollow';
            element.classList = 'btn btn-danger rounded-pill';
        } else {
            count.innerHTML--;
            element.innerHTML = 'Follow';
            element.classList = 'btn btn-primary rounded-pill';
        }

    })
}

function like(x) {
    const div = x.parentElement;
    const heart = x.querySelector(".heart");
    let counter = x.querySelector(".counter");
    if (heart.classList.value == "fa-solid fa-heart heart") {
        heart.classList = "fa-regular fa-heart heart";
        counter.innerHTML--;
    } else {
        heart.classList = "fa-solid fa-heart heart";
        counter.innerHTML++;
    }

    console.log(div.querySelector('.id').value);

    fetch('likePost', {
        method: 'PUT',
        headers: {"Content-type": "application/json", "X-CSRFToken": getCookie("csrftoken")},
        body: JSON.stringify({
            id: div.querySelector('.id').value,
        })
    })
    
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if(parts.length == 2) return parts.pop().split(';').shift();
}

function editPost(edit) {
    const div = edit.parentElement
    const message = div.querySelector('.message');
    const textarea = document.createElement('textarea');
    textarea.id = 'content'
    textarea.classList = 'form-control';
    textarea.innerHTML = message.innerHTML;
    console.log(message.innerHTML);
    
    message.replaceWith(textarea);
    textarea.setSelectionRange(message.innerHTML.length, message.innerHTML.length);
    textarea.focus();

    const save = document.createElement('div');
    save.classList = 'ba';
    save.innerHTML = 'Save';
    const cancel = document.createElement('div');
    cancel.classList = 'ba';
    cancel.innerHTML = 'Cancel';

    const line = document.createElement('div');
    line.append(save, cancel);

    cancel.addEventListener('click', () => {
        line.replaceWith(edit);
        textarea.replaceWith(message);
    })

    save.addEventListener('click', () => {
        const content = document.querySelector('#content');
        fetch('editPost', {
            method: 'PUT',
            headers: {"Content-type": "application/json", "X-CSRFToken": getCookie("csrftoken")},
            body: JSON.stringify({
                id: div.querySelector('.id').value,
                message: content.value
            })
        })
        .then(
            textarea.replaceWith(message),
            message.innerHTML = content.value,
            line.replaceWith(edit)
        )
    })

    edit.replaceWith(line);
}