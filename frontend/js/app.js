// Socket.IO client-side configuration
const socket = io();

// DOM elements
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");

// Event listener for chat form submission
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const messageInput = e.target.elements.message;
  const message = messageInput.value;

  // Emit the message event to the server
  socket.emit("message", message);

  // Clear the input field
  messageInput.value = "";
  messageInput.focus();
});

// Event listener for message event
socket.on("message", (data) => {
  displayMessage(data);
});

// Function to display a message on the chat screen
function displayMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
    <p class="meta">User <span>${message.username}</span></p>
    <p class="text">${message.text}</p>
    <p class="time">${message.time}</p>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
