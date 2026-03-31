export const LessonSidebar = ({ course, selectedLessonId, onSelectLesson }) => (
  <div className="lesson-sidebar">
    <h4 className="fw-bold mb-3">{course.title}</h4>
    {course.modules.map((module) => (
      <div key={module._id} className="mb-4">
        <div className="text-uppercase small text-secondary fw-semibold mb-2">{module.title}</div>
        <div className="list-group">
          {module.lessons.map((lesson) => {
            const isActive = lesson._id === selectedLessonId;
            return (
              <button
                key={lesson._id}
                type="button"
                className={`list-group-item list-group-item-action ${isActive ? "active" : ""}`}
                onClick={() => onSelectLesson(module._id, lesson._id)}
              >
                <div className="fw-semibold">{lesson.title}</div>
                <div className="small opacity-75">{lesson.type}</div>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);
