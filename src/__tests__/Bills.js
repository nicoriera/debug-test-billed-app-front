/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import { formatDate } from "../app/format.js";
import mockStore from "../__mocks__/store";

jest.mock("../app/format.js", () => ({
  formatDate: jest.fn(),
  formatStatus: jest.fn(),
}));

console.log(ROUTES_PATH["NewBill"]);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const chrono = (a, b) => new Date(a) - new Date(b); // Changed this line
      const datesSorted = [...dates].sort(chrono);
      expect(dates).toEqual(datesSorted);
    });

    test("When I click on the eye icon, then the bill proof modal should open", async () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const billsContainer = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const iconEye = screen.getAllByTestId("icon-eye")[0];
      $.fn.modal = jest.fn();

      billsContainer.handleClickIconEye(iconEye);

      expect($.fn.modal).toHaveBeenCalledWith("show");
    });

    test("Then, getBills should format dates correctly", async () => {
      const billsContainer = new Bills({
        document,
        onNavigate: null,
        store: mockStore,
        localStorage: window.localStorage,
      });

      formatDate.mockImplementation((date) => date);

      const bills = await billsContainer.getBills();
      expect(formatDate).toHaveBeenCalled();
      expect(bills.length).toBe(4); // Assurez-vous que ce nombre correspond au nombre de factures dans votre mock
    });

    test("Then, getBills should handle formatDate errors", async () => {
      const billsContainer = new Bills({
        document,
        onNavigate: null,
        store: mockStore,
        localStorage: window.localStorage,
      });

      formatDate.mockImplementation(() => {
        throw new Error("Format date error");
      });

      const bills = await billsContainer.getBills();
      expect(bills.length).toBe(4); // Les factures devraient toujours être retournées, même si le formatage échoue
    });

    test("Then, all eye icons should have click event listeners", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const billsContainer = new Bills({
        document,
        onNavigate: null,
        store: null,
        localStorage: window.localStorage,
      });

      const iconEye = screen.getAllByTestId("icon-eye");
      expect(iconEye.length).toBe(4); // Assurez-vous que ce nombre correspond au nombre de factures dans votre mock

      const handleClickIconEyeSpy = jest.spyOn(
        billsContainer,
        "handleClickIconEye"
      );
      iconEye.forEach((icon) => {
        icon.click();
      });
      expect(handleClickIconEyeSpy).toHaveBeenCalledTimes(4);
    });

    test("Then, getBills should return null if store is not defined", async () => {
      const billsContainer = new Bills({
        document,
        onNavigate: null,
        store: null,
        localStorage: window.localStorage,
      });

      const result = await billsContainer.getBills();
      expect(result).toBeUndefined();
    });
  });
});
