export const isValidInput = (input: string) => {
  //assuming input > 0
  const validInputRegex = /[a-zA-Z0-9]/;
  const trimmedInput = input.trim();
  return trimmedInput.length > 0 && validInputRegex.test(trimmedInput);
};

export const isValidName = (input: string): boolean => {
  const trimmedInput = input.trim();

  //currently counting empty string as Valid name - this could be changed later if it calls for it
  if (trimmedInput.length === 0) return true;

  const nameRegex = /^[a-zA-Z\s]+$/;
  const hasSpace = /\s/.test(trimmedInput);
  // very loose check to make sure its onnly letters and at least one space (assumes first and last name)
  // does handle 3 word+ names

  return nameRegex.test(trimmedInput) && hasSpace;
};

export function convertUtcToCst(utcDateTimeString: string): string {
  const date = new Date(utcDateTimeString);

  // Explicitly type the options object as Intl.DateTimeFormatOptions
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Chicago",
    year: "numeric", // Now TypeScript knows this 'numeric' is the *literal* string
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const cstFormatter = new Intl.DateTimeFormat("en-US", options);
  const cstDateTime = cstFormatter.format(date);

  return cstDateTime;
}
