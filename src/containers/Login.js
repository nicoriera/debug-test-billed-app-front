import { ROUTES_PATH } from "../constants/routes.js";
export let PREVIOUS_LOCATION = "";

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({
    document,
    localStorage,
    onNavigate,
    PREVIOUS_LOCATION,
    store,
  }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
    this.store = store;

    // Utiliser setTimeout pour s'assurer que le DOM est chargé
    setTimeout(() => this.addEventListeners(), 0);

    // Ajouter une vérification de connexion au chargement
    this.checkAuth();
  }

  addEventListeners = () => {
    const formEmployee = this.document.querySelector(
      `form[data-testid="form-employee"]`
    );
    const formAdmin = this.document.querySelector(
      `form[data-testid="form-admin"]`
    );

    if (formEmployee) {
      formEmployee.addEventListener("submit", this.handleSubmitEmployee);
    }
    if (formAdmin) {
      formAdmin.addEventListener("submit", this.handleSubmitAdmin);
    }
  };

  handleSubmitEmployee = (e) => {
    e.preventDefault();
    const user = {
      type: "Employee",
      email: e.target
        .querySelector(`input[data-testid="employee-email-input"]`)
        .value.trim(),
      password: e.target
        .querySelector(`input[data-testid="employee-password-input"]`)
        .value.trim(),
      status: "connected",
    };
    this.localStorage.setItem("user", JSON.stringify(user));
    return this.login(user)
      .then(() => {
        this.onNavigate(ROUTES_PATH["Bills"]);

        this.PREVIOUS_LOCATION = ROUTES_PATH["Bills"];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        this.document.body.style.backgroundColor = "#fff";
      })
      .catch((err) => {
        console.error("Login failed, attempting to create user:", err);
        return this.createUser(user);
      })
      .then(() => {
        console.log("User creation successful or not needed");
      })
      .catch((err) => {
        console.error("User creation failed:", err);
      });
  };

  handleSubmitAdmin = (e) => {
    e.preventDefault();
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`)
        .value,
      password: e.target.querySelector(
        `input[data-testid="admin-password-input"]`
      ).value,
      status: "connected",
    };
    this.localStorage.setItem("user", JSON.stringify(user));
    return this.login(user)
      .catch((err) => this.createUser(user))
      .then(() => {
        this.onNavigate(ROUTES_PATH["Dashboard"]);
        this.PREVIOUS_LOCATION = ROUTES_PATH["Dashboard"];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        document.body.style.backgroundColor = "#fff";
      });
  };

  // Ajouter une méthode pour vérifier l'authentification
  checkAuth = () => {
    const userStr = this.localStorage.getItem("user");
    if (!userStr) return; // Add check for undefined or null
    const user = JSON.parse(userStr);
    const jwt = this.localStorage.getItem("jwt");
    if (user && jwt) {
      if (user.type === "Employee") {
        this.onNavigate(ROUTES_PATH["Bills"]);
      } else if (user.type === "Admin") {
        this.onNavigate(ROUTES_PATH["Dashboard"]);
      }
    }
  };

  // not need to cover this function by tests
  login = (user) => {
    if (this.store) {
      return this.store
        .login(
          JSON.stringify({
            email: user.email,
            password: user.password,
          })
        )
        .then(({ jwt }) => {
          this.localStorage.setItem("jwt", jwt);
        })
        .catch((err) => {
          console.error("Login failed:", err);
          throw err;
        });
    } else {
      return Promise.reject(new Error("Store is not initialized"));
    }
  };

  // not need to cover this function by tests
  createUser = (user) => {
    if (this.store) {
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split("@")[0],
            email: user.email,
            password: user.password,
          }),
        })
        .then(() => {
          console.log(`User with ${user.email} is created`);
          return this.login(user);
        });
    } else {
      return Promise.reject(new Error("Store is not initialized"));
    }
  };
}
