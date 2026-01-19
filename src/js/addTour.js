import axios from "axios";
import { showAlert } from "./alert.js";

export const addTour = async (data, images) => {
  try {
    const response = await axios.post("/api/v1/tours", data);
    const id = response.data.data.document.id;
    const slug = response.data.data.document.slug;
    if (response.data.status === "success") {
      try {
        const imageResponse = await axios.patch(`/api/v1/tours/${id}`, images);
        if (imageResponse.data.status === "success") {
          showAlert("success", "Tour added successfully");
          window.setTimeout(() => {
            location.assign(`/tour/${slug}`);
          }, 1500);
        }
      } catch (error) {
        showAlert("error", error.response.data.message);
        await axios.delete(`api/v1/tours/${id}`);
      }
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
