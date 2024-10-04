/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "employee@test.com",
    })
  );

  describe("When I am on NewBill Page", () => {
    test("Then the new bill form should be displayed", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    test("Then I can upload a file with correct extension", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");
      file.addEventListener("change", handleChangeFile);

      fireEvent.change(file, {
        target: {
          files: [new File(["test"], "test.jpg", { type: "image/jpg" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files[0].name).toBe("test.jpg");
    });

    test("Then I cannot upload a file with incorrect extension", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Mock window.alert
      jest.spyOn(window, "alert").mockImplementation(() => {});

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");
      file.addEventListener("change", handleChangeFile);

      fireEvent.change(file, {
        target: {
          files: [new File(["test"], "test.pdf", { type: "application/pdf" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.value).toBe("");
      expect(window.alert).toHaveBeenCalledWith(
        "Seuls les fichiers jpg, jpeg et png sont autorisés."
      );
    });

    test("Then I can submit a new bill", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      form.addEventListener("submit", handleSubmit);

      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
    });

    test("Then I can fill out the form and submit a new bill", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const store = {
        bills: jest.fn(() => ({
          create: jest.fn(() =>
            Promise.resolve({
              fileUrl: "http://localhost:3456/images/test.jpg",
              key: "1234",
            })
          ),
          update: jest.fn(() => Promise.resolve({})),
        })),
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Simuler le remplissage du formulaire
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Vol Paris-Londres";
      screen.getByTestId("datepicker").value = "2023-04-14";
      screen.getByTestId("amount").value = "250";
      screen.getByTestId("vat").value = "70";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "Voyage d'affaires";

      // Simuler le téléchargement d'un fichier
      const file = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [
            new File(["file contents"], "ticket.png", { type: "image/png" }),
          ],
        },
      });

      await waitFor(() => expect(handleChangeFile).toHaveBeenCalled());
      expect(newBill.billId).toBe("1234");
      expect(newBill.fileUrl).toBe("http://localhost:3456/images/test.jpg");
      expect(newBill.fileName).toBe("ticket.png");

      // Soumettre le formulaire
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn(newBill.handleSubmit);
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(store.bills().update).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
    });

    // Nouveau test d'intégration POST
    test("Then I can post a new bill (integration test)", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Préparation du localStorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.com",
        })
      );

      // Mock de la fonction update
      const updateSpy = jest.spyOn(mockStore.bills(), "update");
      updateSpy.mockResolvedValue({});

      const onNavigate = jest.fn();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Remplissage du formulaire
      const typeInput = screen.getByTestId("expense-type");
      fireEvent.change(typeInput, { target: { value: "Transports" } });

      const nameInput = screen.getByTestId("expense-name");
      fireEvent.change(nameInput, { target: { value: "Test Transport" } });

      const dateInput = screen.getByTestId("datepicker");
      fireEvent.change(dateInput, { target: { value: "2023-04-14" } });

      const amountInput = screen.getByTestId("amount");
      fireEvent.change(amountInput, { target: { value: "100" } });

      const vatInput = screen.getByTestId("vat");
      fireEvent.change(vatInput, { target: { value: "20" } });

      const pctInput = screen.getByTestId("pct");
      fireEvent.change(pctInput, { target: { value: "20" } });

      const commentaryInput = screen.getByTestId("commentary");
      fireEvent.change(commentaryInput, {
        target: { value: "Test commentary" },
      });

      // Simulation de l'upload de fichier
      const file = new File(["test"], "test.jpg", { type: "image/jpg" });
      const fileInput = screen.getByTestId("file");
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Attendre que le fichier soit "uploadé"
      await waitFor(() => {
        expect(newBill.fileUrl).not.toBeNull();
        expect(newBill.fileName).not.toBeNull();
      });

      // Soumission du formulaire
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Vérifications
      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });

    test("Then the form listeners should be set up correctly", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Spy on the handleSubmit and handleChangeFile methods
      const handleSubmitSpy = jest.spyOn(NewBill.prototype, "handleSubmit");
      const handleChangeFileSpy = jest.spyOn(
        NewBill.prototype,
        "handleChangeFile"
      );

      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });

      const formNewBill = screen.getByTestId("form-new-bill");
      const fileInput = screen.getByTestId("file");

      // Trigger the events
      fireEvent.submit(formNewBill);
      fireEvent.change(fileInput);

      // Check if the correct methods were called
      expect(handleSubmitSpy).toHaveBeenCalled();
      expect(handleChangeFileSpy).toHaveBeenCalled();

      // Clean up the spies
      handleSubmitSpy.mockRestore();
      handleChangeFileSpy.mockRestore();
    });

    test("Then handleChangeFile should update billId, fileUrl and fileName on API success", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const store = {
        bills: jest.fn(() => ({
          create: jest.fn().mockResolvedValue({
            fileUrl: "http://localhost:3456/images/test.jpg",
            key: "1234",
          }),
        })),
      };
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store,
        localStorage: window.localStorage,
      });

      const file = new File(["test"], "test.jpg", { type: "image/jpg" });
      const event = {
        preventDefault: jest.fn(),
        target: { value: "C:\\fakepath\\test.jpg", files: [file] },
      };

      await newBill.handleChangeFile(event);

      expect(newBill.billId).toBe("1234");
      expect(newBill.fileUrl).toBe("http://localhost:3456/images/test.jpg");
      expect(newBill.fileName).toBe("test.jpg");
    });

    test("Then handleSubmit should create the correct bill object", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });
      newBill.updateBill = jest.fn();

      // Set up form values
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Test expense";
      screen.getByTestId("datepicker").value = "2023-04-14";
      screen.getByTestId("amount").value = "100";
      screen.getByTestId("vat").value = "20";
      screen.getByTestId("pct").value = "";
      screen.getByTestId("commentary").value = "Test comment";

      const event = {
        preventDefault: jest.fn(),
        target: document.querySelector('form[data-testid="form-new-bill"]'),
      };

      newBill.handleSubmit(event);

      expect(newBill.updateBill).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "Transports",
          name: "Test expense",
          date: "2023-04-14",
          amount: 100,
          vat: "20",
          pct: 20,
          commentary: "Test comment",
          status: "pending",
        })
      );
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.com",
        })
      );
    });

    test("Then it should handle 404 error from API", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Mock console.error
      jest.spyOn(console, "error").mockImplementation(() => {});

      const file = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      file.addEventListener("change", handleChangeFile);

      fireEvent.change(file, {
        target: {
          files: [new File(["test"], "test.jpg", { type: "image/jpg" })],
        },
      });

      await waitFor(() => expect(handleChangeFile).toHaveBeenCalled());
      expect(console.error).toHaveBeenCalled();
    });

    test("Then it should handle 500 error from API", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Mock console.error
      jest.spyOn(console, "error").mockImplementation(() => {});

      const file = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      file.addEventListener("change", handleChangeFile);

      fireEvent.change(file, {
        target: {
          files: [new File(["test"], "test.jpg", { type: "image/jpg" })],
        },
      });

      await waitFor(() => expect(handleChangeFile).toHaveBeenCalled());
      expect(console.error).toHaveBeenCalled();
    });
  });
});
