const initForm = (() => {
  const socket = io.connect();
  const logOut = document.getElementById("log-out-img")
  const radios = document.querySelectorAll("input[type=radio]");
  const searchForm = document.getElementById("search-form");
  const toggleForm = document.getElementById("toggle-search-form");

  [...radios].forEach((radio) => {
    radio.addEventListener("change", allowSubmit);
  });

  function allowSubmit() {
    const submitBtn = document.getElementById("search-submit-btn");
    submitBtn.disabled = false;
  }

  toggleForm.onclick = () => {
    searchForm.classList.toggle("hide");
  };

  logOut.onclick = () => {
    socket.emit("log-out", {
      id: userid,
      display_name: user_display_name,
      friends: [user_friends],
    });
  }
})();
