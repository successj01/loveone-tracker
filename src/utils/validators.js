const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-\s0-9]{7,18}$/;

export function required(value) {
  return value != null && String(value).trim().length > 0;
}

export function isEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

export function isValidPhone(value) {
  return PHONE_RE.test(String(value || "").trim());
}

export function isStrongPassword(value) {
  return String(value || "").length >= 6;
}

export function validateLogin(values) {
  const errors = {};
  if (!required(values.email)) errors.email = "Email is required.";
  else if (!isEmail(values.email)) errors.email = "Enter a valid email.";
  if (!required(values.password)) errors.password = "Password is required.";
  return errors;
}

export function validateRegister(values) {
  const errors = {};
  if (!required(values.name)) errors.name = "Full name is required.";
  if (!required(values.email)) errors.email = "Email is required.";
  else if (!isEmail(values.email)) errors.email = "Enter a valid email.";
  if (!isStrongPassword(values.password))
    errors.password = "Password must be at least 6 characters.";
  if (values.password !== values.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function validateLovedOneRequest(values) {
  const errors = {};
  if (!required(values.email)) errors.email = "Email is required.";
  else if (!isEmail(values.email)) errors.email = "Enter a valid email.";
  if (!required(values.relationship))
    errors.relationship = "Pick a relationship.";
  return errors;
}

export function validateProfile(values) {
  const errors = {};
  if (!required(values.name)) errors.name = "Full name is required.";
  if (values.phone && !isValidPhone(values.phone))
    errors.phone = "Enter a valid phone number.";
  return errors;
}