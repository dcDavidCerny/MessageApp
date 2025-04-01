export const formatMessage = (message: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="href-link"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};
