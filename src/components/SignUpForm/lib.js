import * as yup from "yup";

import { emailRegexp } from "../../constants/auth";

export const registerValidationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Ім'я має містити щонайменше 2 символи")
    .max(30, "Ім'я має містити не більше 30 символів")
    .required("Ім'я обов'язкове"),

  email: yup
    .string()
    .trim()
    .max(255, "Email має містити не більше 255 символів")
    .matches(emailRegexp, "Email має бути у форматі example@mail.com")
    .required("Email обов'язковий"),

  password: yup
    .string()
    .trim()
    .min(6, "Пароль має містити щонайменше 6 символів")
    .max(255, "Пароль має містити не більше 255 символів")
    .required("Пароль обов'язковий"),
});
