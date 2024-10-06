// // Format the validation errors to be more user-friendly
// const validationErrors = error.details.map(err => ({
//   field: err.path.join('.'),
//   message: `${capitalizeFirstLetter(err.context.label)} is required`
// }));

// Helper function to capitalize the first letter
// const capitalizeFirstLetter = (string) => {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// };

// Helper function to format the error message
export const formatErrorMessage = (label) => {
  return label
    .replace(/([A-Z])/g, ' $1') // Add a space before each capital letter
    .trim()                     // Trim any leading/trailing spaces
    .replace(/^\w/, c => c.toUpperCase()) // Capitalize the first letter
    + ' is required';           // Append the required message
};