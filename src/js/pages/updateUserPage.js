import { updateSettings } from "../api/updateUser.js";

const updateDataForm = document.querySelector(".form-user-data");
const updatePasswordForm = document.querySelector(".form-user-settings");

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
      "password",
    );
    document.querySelector(".btn--save--password").textContent =
      "SAVE PASSWORD";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}
