export const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (data?.errors?.length) return data.errors[0].message;
  if (data?.message) return data.message;
  if (error?.request) return 'Cannot reach the server. Is it running?';

  return 'Something went wrong. Please try again.';
};