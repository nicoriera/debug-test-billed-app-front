/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

import { fireEvent, screen } from "@testing-library/dom";

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
});

// New tests
describe("checkAuth", () => {
  test("It should navigate to Bills if user is Employee", () => {
    const localStorageMock = {
      getItem: jest.fn(() => JSON.stringify({ type: "Employee" })),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    const onNavigateMock = jest.fn();
    const login = new Login({
      document: document,
      localStorage: window.localStorage,
      onNavigate: onNavigateMock,
      PREVIOUS_LOCATION: "",
      store: null,
    });

    login.checkAuth();
    expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
  });

  test("It should navigate to Dashboard if user is Admin", () => {
    const localStorageMock = {
      getItem: jest.fn(() => JSON.stringify({ type: "Admin" })),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    const onNavigateMock = jest.fn();
    const login = new Login({
      document: document,
      localStorage: window.localStorage,
      onNavigate: onNavigateMock,
      PREVIOUS_LOCATION: "",
      store: null,
    });

    login.checkAuth();
    expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH["Dashboard"]);
  });

  test("It should not navigate if user is not present", () => {
    const localStorageMock = {
      getItem: jest.fn(() => null),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    const onNavigateMock = jest.fn();
    const login = new Login({
      document: document,
      localStorage: window.localStorage,
      onNavigate: onNavigateMock,
      PREVIOUS_LOCATION: "",
      store: null,
    });

    login.checkAuth();
    expect(onNavigateMock).not.toHaveBeenCalled();
  });
});

describe("Login page", () => {
  beforeEach(() => {
    // Utiliser les faux timers pour contrôler setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Réinitialiser les timers après chaque test
    jest.useRealTimers();
  });

  test("It should call addEventListeners after setTimeout", () => {
    // Insérer le HTML de la page de login
    document.body.innerHTML = LoginUI();

    // Mock des dépendances de Login
    const onNavigate = jest.fn();
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    const login = new Login({
      document: document,
      localStorage: localStorageMock,
      onNavigate,
      PREVIOUS_LOCATION: "",
      store: null,
    });

    // Spy sur la méthode addEventListeners pour vérifier qu'elle est appelée
    const addEventListenersSpy = jest.spyOn(login, "addEventListeners");

    // Avancer tous les timers (ici, cela simule la fin du setTimeout)
    jest.runAllTimers();

    // Vérifier que addEventListeners a bien été appelé après le setTimeout
    expect(addEventListenersSpy).toHaveBeenCalled();
  });
});

describe("Login - Error cases", () => {
  beforeEach(() => {
    // Insert the HTML of the login page before each test
    document.body.innerHTML = LoginUI();
  });

  test("It should handle login error", async () => {
    const onNavigate = jest.fn();
    const localStorageMock = {
      setItem: jest.fn(),
      getItem: jest.fn(),
    };

    const storeMock = {
      login: jest.fn().mockRejectedValue(new Error("Login failed")),
    };

    const login = new Login({
      document: document,
      localStorage: localStorageMock,
      onNavigate,
      PREVIOUS_LOCATION: "",
      store: storeMock,
    });

    const handleSubmit = jest.fn(login.handleSubmitEmployee);
    login.login = jest.fn().mockRejectedValue(new Error("Login failed")); // Mock login to reject

    const form = screen.getByTestId("form-employee");
    form.addEventListener("submit", handleSubmit);

    fireEvent.submit(form);

    await expect(handleSubmit).toHaveBeenCalled();
    await expect(login.login).toHaveBeenCalled();
    await expect(login.login).rejects.toThrow("Login failed");
  });
});
