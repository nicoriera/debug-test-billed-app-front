/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

// Main test suite for the NewBill component
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill page", () => {
    // Test for the mail icon in the vertical layout
    test("Then the mail icon in the vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      const isIconActivated = windowIcon.classList.contains("active-icon");
      expect(isIconActivated).toBeTruthy();
    });

    // Test suite for the NewBill form
    describe("Then I am on NewBill page with a form", () => {
      test("Then all the form inputs should be rendered correctly", () => {
        document.body.innerHTML = NewBillUI();

        const formNewBill = screen.getByTestId("form-new-bill");
        const type = screen.getAllByTestId("expense-type");
        const name = screen.getAllByTestId("expense-name");
        const date = screen.getAllByTestId("datepicker");
        const amount = screen.getAllByTestId("amount");
        const vat = screen.getAllByTestId("vat");
        const pct = screen.getAllByTestId("pct");
        const commentary = screen.getAllByTestId("commentary");
        const file = screen.getAllByTestId("file");
        const submitBtn = document.querySelector("#btn-send-bill");

        expect(formNewBill).toBeTruthy();
        expect(type).toBeTruthy();
        expect(name).toBeTruthy();
        expect(date).toBeTruthy();
        expect(amount).toBeTruthy();
        expect(vat).toBeTruthy();
        expect(pct).toBeTruthy();
        expect(commentary).toBeTruthy();
        expect(file).toBeTruthy();
        expect(submitBtn).toBeTruthy();

        expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      });
    });

    // Test suite for file upload functionality
    describe("When uploading a file", () => {
      test("Then, if the file format is accepted, it should be handled correctly", () => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
        const file = screen.getByTestId("file");

        window.alert = jest.fn();

        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["file.png"], "file.png", { type: "image/png" })],
          },
        });

        jest.spyOn(window, "alert");
        expect(alert).not.toHaveBeenCalled();

        expect(handleChangeFile).toHaveBeenCalled();
        expect(file.files[0].name).toBe("file.png");
        expect(newBill.fileName).toBe("file.png");
        expect(newBill.isImgFormatValid).toBe(true);
        expect(newBill.formData).not.toBe(null);
      });

      test("Then, if the file format is not accepted, an alert should be displayed", () => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const file = screen.getByTestId("file");

        window.alert = jest.fn();

        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
          },
        });

        jest.spyOn(window, "alert");
        expect(alert).toHaveBeenCalled();

        expect(handleChangeFile).toHaveBeenCalled();
        expect(newBill.fileName).toBe(null);
        expect(newBill.isImgFormatValid).toBe(false);
        expect(newBill.formData).toBe(undefined);
      });
    });

    // Test suite for form submission
    describe("When submitting the form", () => {
      test("Then the handleSubmit function should be called", () => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        newBill.isImgFormatValid = true;

        const formNewBill = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(newBill.handleSubmit);
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);

        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});

// Test suite for API integration
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Dashboard employee", () => {
    // Test for successful bill creation
    test("Then it should be possible to create a new bill via mock API POST", async () => {
      const postSpy = jest.spyOn(mockStore, "bills");
      const bill = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20,
      };
      const postBills = await mockStore.bills().update(bill);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postBills).toStrictEqual(bill);
    });

    // Test suite for API error handling
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
      });

      test("Then it should log a 404 error when API returns a 404", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("404"))),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });
        newBill.isImgFormatValid = true;

        // Submit form
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error("404"));
      });

      test("Then it should log a 500 error when API returns a 500", async () => {
        const postSpy = jest.spyOn(console, "error");

        const store = {
          bills: jest.fn(() => newBill.store),
          create: jest.fn(() => Promise.resolve({})),
          update: jest.fn(() => Promise.reject(new Error("500"))),
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });
        newBill.isImgFormatValid = true;

        // Submit form
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(postSpy).toBeCalledWith(new Error("500"));
      });
    });
  });
});
