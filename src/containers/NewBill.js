import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    // Initialisations regroupées
    this.billId = null;
    this.fileUrl = null;
    this.fileName = null;

    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);

    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = fileName.split(".").pop().toLowerCase();

    // Supprimer l'ancien message d'erreur s'il existe
    const oldErrorMessage = this.document.querySelector("#file-error-message");
    if (oldErrorMessage) {
      oldErrorMessage.remove();
    }

    if (!allowedExtensions.includes(fileExtension)) {
      console.error("Type de fichier non autorisé");
      this.document.querySelector(`input[data-testid="file"]`).value = "";

      // Ajouter un nouveau message d'erreur
      const errorMessage = this.document.createElement("p");
      errorMessage.id = "file-error-message"; // Ajouter un ID pour faciliter la suppression
      errorMessage.textContent =
        "Type de fichier non autorisé. Veuillez choisir une image (jpg, jpeg, png).";
      errorMessage.style.color = "red";
      this.document
        .querySelector(`input[data-testid="file"]`)
        .parentNode.appendChild(errorMessage);
      return;
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    console.log("Calling store.bills().create");
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        console.log("File uploaded successfully:", fileUrl, key);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => {
        console.error("Erreur lors du téléchargement du fichier :", error);
        this.document.querySelector(`input[data-testid="file"]`).value = "";
      });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    // Validation basique des champs
    const requiredFields = [
      "expense-type",
      "expense-name",
      "datepicker",
      "amount",
      "vat",
      "pct",
    ];
    for (const field of requiredFields) {
      const input = e.target.querySelector(`[data-testid="${field}"]`);
      if (!input.value) {
        console.error(`Le champ ${field} est requis`);
        return;
      }
    }

    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
  };

  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
