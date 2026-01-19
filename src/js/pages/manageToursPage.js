import { deleteItem } from "../api/delete.js";

// DELETE TOUR
const deleteButtons = document.querySelectorAll(
  ".admin-tour-actions .btn--danger",
);
const modal = document.getElementById("confirmModal");
const cancelBtn = document.getElementById("cancelDelete");
const confirmBtn = document.getElementById("confirmDelete");

if (deleteButtons.length > 0) {
  let selectedId = null;
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      selectedId = e.currentTarget.dataset.tourId;
      modal.classList.remove("hidden");
    });
  });

  // cancel delete
  cancelBtn.addEventListener("click", () => {
    selectedId = null;
    modal.classList.add("hidden");
  });

  // confirm delete
  confirmBtn.addEventListener("click", async () => {
    if (!selectedId) return;
    await deleteItem("tours", selectedId);
    modal.classList.add("hidden");
    selectedId = null;
  });
}
