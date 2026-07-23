export const transformZodErrors = (error) => {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
};

export const setFieldErrors = (form, errors) => {
  if (!errors) return;
  if (!Array.isArray(errors)) return;

  errors.forEach((error) => {
    form.setError(
      error.path,
      {
        message: error.message,
      },
      { shouldFocus: true },
    );
  });
};
