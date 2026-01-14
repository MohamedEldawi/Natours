import axios from "axios";
import { showAlert } from "./alert";
export const login = async (email, password) => {
  try {
    const response = await axios.post("/api/v1/users/login", {
      email,
      password,
    });
    if (response.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
export const logout = async () => {
  try {
    const response = await axios.get("/api/v1/users/logout");
    if (response.data.status === "success") location.assign("/login");
  } catch (error) {
    showAlert("error", "error in logging you out! Try again later");
  }
};
