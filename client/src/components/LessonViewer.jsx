import { FormattedSummary } from "./FormattedSummary.jsx";

export const LessonViewer = ({ lesson, onSummarise, summary, summaryLoading }) => {
  if (!lesson) {
    return (
      <div className="lesson-viewer">
        <h3>Select a lesson</h3>
      </div>
    );
  }

  return (
    <div className="lesson-viewer">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <span className="badge bg-dark-subtle text-dark text-uppercase">{lesson.type}</span>
          <h2 className="mt-3 fw-bold">{lesson.title}</h2>
          <p className="text-secondary">{lesson.description}</p>
        </div>
        {lesson.type === "document" ? (
          <button className="btn btn-danger" type="button" onClick={onSummarise} disabled={summaryLoading}>
            {summaryLoading ? "Summarising..." : "Summarise with AI"}
          </button>
        ) : null}
      </div>

      {lesson.type === "video" ? (
        <div className="ratio ratio-16x9 rounded overflow-hidden mt-4">
          <iframe src={lesson.videoUrl.replace("watch?v=", "embed/")} title={lesson.title} allowFullScreen />
        </div>
      ) : null}

      {lesson.type === "document" ? (
        <div className="document-card mt-4">
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
            <div>
              <h5 className="mb-1">Document content</h5>
              <div className="small text-secondary">
                AI summarisation uses the text extracted from this uploaded document or the notes saved by the admin.
              </div>
            </div>
            {lesson.assetUrl ? (
              <a className="btn btn-outline-dark btn-sm" href={lesson.assetUrl} target="_blank" rel="noreferrer">
                Open Document
              </a>
            ) : null}
          </div>
          <p className="mb-0 text-secondary">{lesson.extractedText || "No extracted text available yet. Upload a readable document or add notes in the admin panel."}</p>
        </div>
      ) : null}

      {summary ? (
        <div className="summary-card mt-4">
          <h5>AI Summary</h5>
          <FormattedSummary text={summary} />
        </div>
      ) : null}
    </div>
  );
};
