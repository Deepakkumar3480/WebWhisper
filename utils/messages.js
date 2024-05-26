function formatMessage(username, text) {
  const date = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
  };

  return {
    username,
    text,
    time: new Intl.DateTimeFormat("default", options).format(date),
  };
}

module.exports = formatMessage;
