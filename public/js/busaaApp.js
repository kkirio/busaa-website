// Events modal
$(document).ready(() => {
  let apiToken = $("#apiToken").text();
  $("#modal-button").click(() => {
    $(".modal-body").html("");
    $.get(`/api/events?apiToken=${apiToken}`, (results = {}) => {
      let data = results.data;
      if (!data || !data.events) return;
      data.events.forEach((e) => {
        $(".modal-body").append(`
        <div>
          <span class="event-title">${e.title}</span>
          <div class="event-description">${e.description}</div>
          <button class="register-button" data-id="${e._id}">Register</button>
        </div><br />`);
      });
    }).then(() => {
      eventRegisterButton(apiToken);
    });
  });
});

let eventRegisterButton = (token) => {
  $(".register-button").click((event) => {
    let $button = $(event.target),
      eventId = $button.data("id");
    $.get(`/api/events/${eventId}/register?apiToken=${token}`, (results = {}) => {
      let data = results.data;
      if (data && data.success) {
        $button
          .text("Registered")
          .addClass("registered-button")
          .removeClass("register-button");
      } else {
        $button.text("Try again");
      }
    });
  });
};

// Chat messaging
const socket = io();
$("#chatForm").submit(() => {
  let text = $("#chat-input").val(),
    userName = $("#chat-user-name").val(),
    userId = $("#chat-user-id").val();
  socket.emit("message", { content: text, userId: userId, userName: userName });
  $("#chat-input").val("");
  return false;
});
socket.on("message", (message) => {
  displayMessage(message);
  for (let i = 0; i < 5; i++) {
    $(".chat-icon").fadeOut(200).fadeIn(200);
  }
});
socket.on("load all messages", (data) => {
  data.forEach((message) => {
    displayMessage(message);
  });
});
socket.on("user connected", () => {
	displayMessage({
	  userName: "Notice",
	  content: "A user has joined the chat",
	});
  });
socket.on("user disconnected", () => {
  displayMessage({
    userName: "Notice",
    content: "A user has left the chat",
  });
});
let displayMessage = (message) => {
  $("#chat").prepend(
    $("<li>").html(
      `<strong class="message ${getCurrentUserClass(message.user)}">${
        message.userName
      }</strong>: ${message.content}`
    )
  );
};
let getCurrentUserClass = (id) => {
  let userId = $("#chat-user-id").val();
  return userId === id ? "current-user" : "other-user";
};

// Animation to make flash message fade away when the close button is pressed
var close = document.getElementsByClassName("closebtn");
for (var i = 0; i < close.length; i++) {
	close[i].onclick = function() {
	var div = this.parentElement;
	div.style.opacity = "0";
	setTimeout(function() { div.style.display="none"; }, 600);
	}
}