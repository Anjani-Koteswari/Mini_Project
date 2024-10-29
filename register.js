document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const pincode = document.getElementById('pincode').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, email, pincode, username, password })
    })
    .then(response => response.json()) // Expecting JSON response
    .then(data => {
        alert(data.message); // Display the message from the server
        if (data.redirect) {
            window.location.href = data.redirect; // Redirect to the login page
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
