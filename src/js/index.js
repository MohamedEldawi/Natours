import { login, logout } from "./login.js";
import { displayMap } from "./mapBox.js";
import { updateSettings } from "./updateUser.js";
import { getSession } from "./stripe.js";

// geting needed elements
const mapbox = document.getElementById("map");
const logInForm = document.querySelector(".form--login");
const logOutButton = document.querySelector(".nav__el--logout");
const updateDataForm = document.querySelector(".form-user-data");
const updatePasswordForm = document.querySelector(".form-user-settings");
const checkoutButton = document.getElementById("book-tour");

// check if elements exist
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

if (logInForm) {
  logInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await login(email, password);
  });
}
if (logOutButton) {
  logOutButton.addEventListener("click", logout);
}
if (updateDataForm) {
  updateDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("email", document.getElementById("email").value);
    form.append("name", document.getElementById("name").value);
    form.append("photo", document.getElementById("photo").files[0]);
    await updateSettings(form, "data");
  });
}
if (updatePasswordForm) {
  updatePasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save--password").textContent = "Updating...";
    const currentPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { currentPassword, newPassword, passwordConfirm },
      "password"
    );
    document.querySelector(".btn--save--password").textContent =
      "SAVE PASSWORD";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}

if (checkoutButton) {
  checkoutButton.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    const tourId = button.dataset.tourId;
    button.textContent = "Processing...";
    await getSession(tourId);
  });
}
