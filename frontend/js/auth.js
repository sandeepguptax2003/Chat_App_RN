// DOM elements
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

// Event listener for signup form submission
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = e.target.elements.username.value;
  const email = e.target.elements.email.value;
  const password = e.target.elements.password.value;

  // Make a POST request to the signup endpoint
  fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      if (data.success) {
        alert(
          "Registration successful. Please check your email for verification."
        );
        // Redirect to login page
        window.location.href = "/login.html";
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

// Event listener for login form submission
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.elements.email.value;
  const password = e.target.elements.password.value;

  // Make a POST request to the login endpoint
  fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      if (data.success) {
        // Save the JWT token in local storage
        localStorage.setItem("token", data.token);
        // Redirect to chat page
        window.location.href = "/chat.html";
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
