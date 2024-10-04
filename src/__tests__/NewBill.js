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
          create: jest.fn(() => Promise.resolve({})),
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
      Object.defineProperty(file, "files", {
        value: [
          new File(["file contents"], "ticket.png", { type: "image/png" }),
        ],
      });
      fireEvent.change(file);

      // Soumettre le formulaire
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
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
