export const formErrors = {
  fieldRequired: (field: string): string => `${field} is required`,
  invalidEmail: "This email address format is invalid",
  invalidPassword:
    "Must contain uppercase, lowercase, numerical, and special characters",
  passwordLength: "Password must be at least 8 characters",
  unmatchedPassword: "Passwords do not match",
};

export const loginInputLabels = {
  email: "Email address",
  password: "Password",
};
