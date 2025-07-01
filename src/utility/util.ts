export const isValidInput = (input: string) => {
  //assuming input > 0
  const validInputRegex = /[a-zA-Z0-9]/;
  const trimmedInput = input.trim();
  return trimmedInput.length > 0 && validInputRegex.test(trimmedInput);
};
