import axios from "axios";
import { showAlert } from "./alert.js";

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const response = await axios.post("/api/v1/users/signup", {
      name,
      email,
      password,
      passwordConfirm,
    });
    if (response.data.status === "success") {
      showAlert("success", "Account Created Successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
