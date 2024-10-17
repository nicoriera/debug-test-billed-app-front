/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Store from "../app/Store.js";

// Mock the Store module
jest.mock("../app/Store.js");

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    });

    test("Then the new bill form should be displayed", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    describe("When I change the file input", () => {
      test("Then, if I upload a valid file, handleChangeFile should be called and fileUrl, fileName should be set", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        const onNavigate = jest.fn();
        const createBill = jest.fn().mockResolvedValue({
          fileUrl: "http://localhost:3456/images/test.jpg",
          key: "1234",
        });
        const store = {
          bills: jest.fn(() => ({ create: createBill })),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
        const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
        const inputFile = screen.getByTestId("file");

        fireEvent.change(inputFile, { target: { files: [file] } });

        await waitFor(() => {
          expect(handleChangeFile).toHaveBeenCalled();
          expect(createBill).toHaveBeenCalled();
          expect(inputFile.files[0]).toBe(file);
        });
      });

      test("Then, if the store throws an error during file upload, an error message should be logged and the file input should be cleared", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        const onNavigate = jest.fn();
        const createBill = jest
          .fn()
          .mockRejectedValue(new Error("Upload failed"));
        const store = {
          bills: jest.fn(() => ({ create: createBill })),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const file = new File(["test"], "test.txt", { type: "text/plain" });
        const inputFile = screen.getByTestId("file");

        fireEvent.change(inputFile, { target: { files: [file] } });

        await waitFor(() => {
          expect(createBill).toHaveBeenCalled();
          expect(consoleSpy).toHaveBeenCalledWith(
            "Erreur lors du téléchargement du fichier :",
            expect.any(Error)
          );
          expect(inputFile.value).toBe("");
        });

        consoleSpy.mockRestore();
      });
    });

    describe("When I submit the form with all required fields filled", () => {
      test("Then, updateBill should be called and navigation to Bills page should occur", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        const onNavigate = jest.fn();
        const updateBill = jest.fn().mockResolvedValue({});
        const store = {
          bills: jest.fn(() => ({ update: updateBill })),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.spyOn(newBill, "handleSubmit");

        fireEvent.submit(form);

        await waitFor(() => {
          expect(handleSubmit).toHaveBeenCalled();
          expect(updateBill).toHaveBeenCalled();
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
        });
      });
    });
  });
});
