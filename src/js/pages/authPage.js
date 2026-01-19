import { login, logout } from "../api/login.js";
import { signup } from "../api/signup.js";

const logInForm = document.querySelector(".form--login");
const signupForm = document.querySelector(".form--signup");
const logOutButton = document.querySelector(".nav__el--logout");

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
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    await signup(name, email, password, confirmPassword);
  });
}
