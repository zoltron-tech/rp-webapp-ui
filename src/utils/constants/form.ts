export const formErrors = {
	invalidEmail: "This email address format is invalid",
	passwordLength: "Password must be at least 8 characters",
	invalidPassword:
		"Must contain uppercase, lowercase, numerical, and special characters",
	unmatchedPassword: "Passwords do not match",
	fieldRequired: (field: string): string => `${field} is required`,
};

export const loginInputLabels = {
	email: "Email address",
	password: "Password",
};
