import { login, logout } from "./login.js";
import { signup } from "./signup.js";
import { displayMap } from "./mapBox.js";
import { updateSettings } from "./updateUser.js";
import { getSession } from "./stripe.js";
import { deleteItem } from "./delete.js";
import { addTour } from "./addTour.js";
import { showAlert } from "./alert.js";

// geting needed elements
const mapbox = document.getElementById("map");
const logInForm = document.querySelector(".form--login");
const signupForm = document.querySelector(".form--signup");
const logOutButton = document.querySelector(".nav__el--logout");
const updateDataForm = document.querySelector(".form-user-data");
const updatePasswordForm = document.querySelector(".form-user-settings");
const checkoutButton = document.getElementById("book-tour");
const deleteButtons = document.querySelectorAll(
  ".admin-tour-actions .btn--danger",
);
const modal = document.getElementById("confirmModal");
const cancelBtn = document.getElementById("cancelDelete");
const confirmBtn = document.getElementById("confirmDelete");

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

if (checkoutButton) {
  checkoutButton.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    const tourId = button.dataset.tourId;
    button.textContent = "Processing...";
    await getSession(tourId);
  });
}
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

//  add tour
const tourForm = document.getElementById("tourForm");
if (tourForm) {
  tourForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const data = new FormData(form);

    const payload = {
      name: data.get("name"),
      price: Number(data.get("price")),
      duration: Number(data.get("duration")),
      maxGroupSize: Number(data.get("maxGroupSize")),
      difficulty: data.get("difficulty"),
      summary: data.get("summary"),
      description: data.get("description"),
      startLocation: {
        description: data.get("startLocationDescription"),
        address: data.get("startLocationAddress"),
        coordinates: [
          Number(data.get("startLng")),
          Number(data.get("startLat")),
        ],
      },

      startDates: data
        .getAll("startDates[]")
        .filter(Boolean)
        .map((d) => new Date(d).toISOString()),

      guides: data.getAll("guides[]").filter(Boolean),

      locations: data
        .getAll("locationDesc[]")
        .filter(Boolean)
        .map((desc, i) => ({
          description: desc,
          coordinates: [
            Number(data.getAll("locationLng[]")[i]),
            Number(data.getAll("locationLat[]")[i]),
          ],
          day: Number(data.getAll("locationDay[]")[i]),
        })),
    };

    // images upload
    const fd = new FormData();
    fd.append("imageCover", data.get("imageCover"));
    if (data.getAll("images").length !== 3) {
      showAlert("error", "Please Provide 3 Imagas for The Tour");
      return;
    }
    data
      .getAll("images")
      .slice(0, 3)
      .forEach((file) => {
        fd.append("images", file);
      });

    await addTour(payload, fd);
  });
}

// add start Dates
const addStartDateBtn = document.getElementById("addStartDateBtn");
const startDatesContainer = document.getElementById("startDatesContainer");
if (addStartDateBtn && startDatesContainer) {
  addStartDateBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "date";
    input.name = "startDates[]";
    input.className = "tour-form__input tour-form__input--inline";
    startDatesContainer.appendChild(input);
  });
}

// add guides
const addGuideBtn = document.getElementById("addGuideBtn");
const guidesContainer = document.getElementById("guidesContainer");

if (addGuideBtn && guidesContainer) {
  addGuideBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.name = "guides[]";
    input.className = "tour-form__input tour-form__input--inline";
    guidesContainer.appendChild(input);
  });
}

// add locations
const addLocationBtn = document.getElementById("addLocationBtn");
const locationsContainer = document.getElementById("locationsContainer");

if (addLocationBtn && locationsContainer) {
  let labelNumber = 1;
  addLocationBtn.addEventListener("click", () => {
    labelNumber += 1;
    const label = document.createElement("label");
    label.className = "tour-form__location-label";
    label.textContent = `Location ${labelNumber}`;
    locationsContainer.append(label);
    const fields = [
      { name: "locationDesc[]", placeholder: "Description" },
      { name: "locationLng[]", placeholder: "Lng" },
      { name: "locationLat[]", placeholder: "Lat" },
      { name: "locationDay[]", placeholder: "Day" },
    ];

    fields.forEach((f) => {
      const input = document.createElement("input");
      input.name = f.name;
      input.placeholder = f.placeholder;
      input.className = "tour-form__input tour-form__input--inline";
      locationsContainer.appendChild(input);
    });
  });
}

// IMAGE COVER PREVIEW
const imageCoverInput = document.getElementById("imageCover");
const imageCoverPreview = document.getElementById("imageCoverPreview");
const imagePlaceholder = document.querySelector(".image-placeholder");
if (imageCoverInput && imageCoverPreview) {
  imageCoverInput.addEventListener("change", () => {
    const file = imageCoverInput.files[0];
    imageCoverPreview.innerHTML = "";
    if (!file) {
      imageCoverPreview.appendChild(imagePlaceholder);
      return;
    }
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = "Image cover preview";
    imageCoverPreview.appendChild(img);
  });
}

// MULTIPLE IMAGES PREVIEW
const imagesInput = document.getElementById("images");
const imagesPreview = document.getElementById("imagesPreview");

if (imagesInput && imagesPreview) {
  imagesInput.addEventListener("change", () => {
    imagesPreview.innerHTML = "";

    const files = Array.from(imagesInput.files).slice(0, 3);

    files.forEach((file) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = "Image preview";
      imagesPreview.appendChild(img);
    });
  });
}
