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

    new Logout({ document, localStorage, onNavigate });
  }

  fileValidation = (file) => {
    const fileTypes = ["image/jpeg", "image/jpg", "image/png"];
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);

    if (!fileTypes.includes(file.type)) {
      fileInput.classList.add("is-invalid");
      return false;
    }
    fileInput.classList.remove("is-invalid");
    return true;
  };

  handleChangeFile = async (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];

    if (!this.fileValidation(file)) {
      console.error("Type de fichier non autorisé");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    try {
      const { fileUrl, key } = await this.store.bills().create({
        data: formData,
        headers: {
          noContentType: true,
        },
      });
      console.log("File uploaded successfully:", fileUrl, key);
      this.billId = key;
      this.fileUrl = fileUrl;
      this.fileName = fileName;
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier :", error);
      e.target.value = "";
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (!this.fileName) {
      console.error("Aucun fichier sélectionné");
      return;
    }

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
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value),
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
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
