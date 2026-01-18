import axios from "axios";
import { showAlert } from "./alert.js";

export const deleteItem = async (itemType, id) => {
  try {
    const response = await axios.delete(`api/v1/${itemType}/${id}`);
    if (response.status === 204) {
      showAlert("success", "Item deleted successfully", 1000);
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
