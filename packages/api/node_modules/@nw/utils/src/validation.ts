export const verifyEmailPattern = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(email);
};

export const checkUsernameInvalidity = (username: string) => {
  if (username.length < 3 || username.length > 50) {
    return true; // Username must be between 3 and 50 characters
  }
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
  return !usernameRegex.test(username);
};

export const verifyPasswordLength = (password: string) => {
  // Password must be at least 8 characters long
  return password.length >= 8;
};

export const verifyPasswordUpperCase = (password: string) => {
  // Password must contain at least one uppercase letter
  return /[A-Z]/.test(password);
};

export const verifyPasswordLowerCase = (password: string) => {
  // Password must contain at least one lowercase letter
  return /[a-z]/.test(password);
};

export const verifyPasswordNumber = (password: string) => {
  // Password must contain at least one number
  return /\d/.test(password);
};

export const verifyPasswordSpecialChar = (password: string) => {
  // Password must contain at least one special character
  return /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

export const verifyPasswordsMatch = (
  password: string,
  confirmPassword: string,
) => {
  if (!password || !confirmPassword) {
    return false;
  }
  return password === confirmPassword;
};

export const verifyPasswordPattern = (password: string) => {
  // Password must be at least 8 characters long, contain at least one uppercase letter,
  // one lowercase letter, one number, and one special character
  if (!password) return false;
  return (
    verifyPasswordLength(password) &&
    verifyPasswordUpperCase(password) &&
    verifyPasswordLowerCase(password) &&
    verifyPasswordNumber(password) &&
    verifyPasswordSpecialChar(password)
  );
};
