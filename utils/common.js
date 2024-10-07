export const formatMessage = (message) => {
  return message.charAt(0).toUpperCase() + message.slice(1).replace(/([A-Z])/g, " $1").trim();
};
