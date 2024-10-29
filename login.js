document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Welcome to Money Maze Navigator!') {
            window.location.href = 'welcome.html'; // Redirect to welcome page
        } else {
            document.getElementById('loginStatus').textContent = data.message;
            document.getElementById('loginStatus').style.color = 'red'; // Highlight error message in red
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loginStatus').textContent = 'An error occurred. Please try again.';
        document.getElementById('loginStatus').style.color = 'red'; // Highlight error message in red
    });
});
