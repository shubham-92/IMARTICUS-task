const normalizeLines = (text) =>
  text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, array) => !(line === "" && array[index - 1] === ""));

const inlineFormat = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
};

export const FormattedSummary = ({ text }) => {
  const lines = normalizeLines(text || "");
  const elements = [];
  let bulletBuffer = [];

  const flushBullets = () => {
    if (!bulletBuffer.length) {
      return;
    }

    elements.push(
      <ul key={`bullets-${elements.length}`} className="summary-list">
        {bulletBuffer.map((item, index) => (
          <li key={index}>{inlineFormat(item)}</li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((line) => {
    if (line.startsWith("- ") || line.startsWith("* ")) {
      bulletBuffer.push(line.slice(2).trim());
      return;
    }

    flushBullets();

    if (line.startsWith("## ")) {
      elements.push(
        <h6 key={`heading-${elements.length}`} className="summary-heading">
          {line.slice(3).trim()}
        </h6>
      );
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h5 key={`heading-${elements.length}`} className="summary-heading">
          {line.slice(2).trim()}
        </h5>
      );
      return;
    }

    elements.push(
      <p key={`paragraph-${elements.length}`} className="summary-paragraph">
        {inlineFormat(line)}
      </p>
    );
  });

  flushBullets();

  return <div className="formatted-summary">{elements}</div>;
};
