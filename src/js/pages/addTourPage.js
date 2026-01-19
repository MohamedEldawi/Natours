import { addTour } from "../api/addTour.js";
import { showAlert } from "../UI/alert.js";

// ADD TOUR
const tourForm = document.getElementById("tourForm");
const saveButton = document.getElementById("saveNewTour");

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
    saveButton.textContent = "Saving...";
    await addTour(payload, fd);
    saveButton.textContent = "Save Tour";
  });
}

// ADD START DATES
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

// ADD GUIDES
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

// ADD LOCATIONS
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

// COVER IMAGE PREVIEW
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
