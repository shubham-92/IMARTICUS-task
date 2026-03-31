import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from "../lib/api.js";

const emptyCourseForm = {
  title: "",
  slug: "",
  shortDescription: "",
  heroDescription: "",
  price: 500,
  category: "Undergraduate Program",
  durationLabel: "",
  modeLabel: "",
  eligibilityLabel: "",
  highlights: "",
  outcomes: "",
  isPublished: false
};

const emptyModuleForm = {
  title: "",
  description: "",
  order: ""
};

const emptyLessonForm = {
  title: "",
  slug: "",
  type: "video",
  sourceType: "youtube",
  videoUrl: "",
  assetUrl: "",
  assetPublicId: "",
  description: "",
  durationInMinutes: "",
  order: "",
  extractedText: "",
  isPreview: false
};

const lessonTypeHelp = {
  video: "Use this for recorded classes, YouTube links, or hosted video assets.",
  document: "Use this for PDFs, DOCX files, notes, guides, or text material that learners can read and summarise.",
  assignment: "Use this for task-based submissions or practice work.",
  quiz: "Use this for assessment-style lessons."
};

const sourceTypeHelp = {
  youtube: "Paste a public or unlisted YouTube lesson URL.",
  vimeo: "Paste a Vimeo video URL.",
  cloudinary: "Use this when the asset is hosted on Cloudinary.",
  upload: "Use this for files uploaded through this admin panel.",
  external: "Use this for any non-YouTube external link.",
  richtext: "Use this for text-first lessons without a separate file."
};

export const AdminDashboardPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [moduleForm, setModuleForm] = useState(emptyModuleForm);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [status, setStatus] = useState("");
  const [assetFile, setAssetFile] = useState(null);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState("");
  const [editingLessonId, setEditingLessonId] = useState("");
  const [moduleEditForm, setModuleEditForm] = useState(emptyModuleForm);
  const [lessonEditForm, setLessonEditForm] = useState(emptyLessonForm);

  const selectedCourse = useMemo(
    () => courses.find((course) => course._id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const selectedModule = useMemo(
    () => selectedCourse?.modules?.find((module) => module._id === selectedModuleId) || null,
    [selectedCourse, selectedModuleId]
  );

  const loadCourses = async (preferredCourseId) => {
    const data = await apiGet("/admin/courses");
    setCourses(data);

    const nextSelectedCourseId = preferredCourseId || selectedCourseId || data[0]?._id || "";
    setSelectedCourseId(nextSelectedCourseId);

    const nextCourse = data.find((course) => course._id === nextSelectedCourseId) || data[0];
    setSelectedModuleId(nextCourse?.modules?.[0]?._id || "");
  };

  useEffect(() => {
    loadCourses().catch((error) => setStatus(error.message));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      setCourseForm({
        title: selectedCourse.title || "",
        slug: selectedCourse.slug || "",
        shortDescription: selectedCourse.shortDescription || "",
        heroDescription: selectedCourse.heroDescription || "",
        price: selectedCourse.price || 500,
        category: selectedCourse.category || "Undergraduate Program",
        durationLabel: selectedCourse.durationLabel || "",
        modeLabel: selectedCourse.modeLabel || "",
        eligibilityLabel: selectedCourse.eligibilityLabel || "",
        highlights: (selectedCourse.highlights || []).join("\n"),
        outcomes: (selectedCourse.outcomes || []).join("\n"),
        isPublished: Boolean(selectedCourse.isPublished)
      });
    } else {
      setCourseForm(emptyCourseForm);
    }
  }, [selectedCourse]);

  const handleCreateCourse = async (event) => {
    event.preventDefault();
    setStatus("Creating course...");

    try {
      const created = await apiPost("/admin/courses", courseForm);
      await loadCourses(created._id);
      setStatus("Course created successfully. Next, add modules and lessons.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleUpdateCourse = async (event) => {
    event.preventDefault();
    if (!selectedCourseId) {
      setStatus("Select a course first.");
      return;
    }

    setStatus("Saving course...");
    try {
      await apiPut(`/admin/courses/${selectedCourseId}`, courseForm);
      await loadCourses(selectedCourseId);
      setStatus("Course details updated.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleAddModule = async (event) => {
    event.preventDefault();
    if (!selectedCourseId) {
      setStatus("Create or select a course first.");
      return;
    }

    setStatus("Adding module...");
    try {
      const updated = await apiPost(`/admin/courses/${selectedCourseId}/modules`, moduleForm);
      const nextModuleId = updated.modules.at(-1)?._id || "";
      setModuleForm(emptyModuleForm);
      await loadCourses(selectedCourseId);
      setSelectedModuleId(nextModuleId);
      setStatus("Module added. You can now add lessons inside it.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleAddLesson = async (event) => {
    event.preventDefault();
    if (!selectedCourseId || !selectedModuleId) {
      setStatus("Select a course and a module first.");
      return;
    }

    setStatus("Adding lesson...");
    try {
      await apiPost(`/admin/courses/${selectedCourseId}/modules/${selectedModuleId}/lessons`, lessonForm);
      setLessonForm(emptyLessonForm);
      setAssetFile(null);
      await loadCourses(selectedCourseId);
      setSelectedModuleId(selectedModuleId);
      setStatus("Lesson added successfully.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleUploadAsset = async () => {
    if (!assetFile) {
      setStatus("Choose a file first.");
      return;
    }

    setUploadingAsset(true);
    setStatus("Uploading asset...");

    try {
      const formData = new FormData();
      formData.append("file", assetFile);
      formData.append("folder", lessonForm.type === "document" ? "documents" : "lessons");
      formData.append("extractText", lessonForm.type === "document" ? "true" : "false");

      const result = await apiUpload("/uploads/asset", formData);

      setLessonForm((current) => ({
        ...current,
        assetUrl: result.assetUrl,
        assetPublicId: result.assetPublicId,
        extractedText: result.extractedText || current.extractedText,
        sourceType:
          current.type === "document"
            ? "upload"
            : result.storage === "cloudinary"
              ? "cloudinary"
              : "upload"
      }));
      setStatus(`Asset uploaded successfully using ${result.storage}.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setUploadingAsset(false);
    }
  };

  const startEditModule = (module) => {
    setEditingModuleId(module._id);
    setModuleEditForm({
      title: module.title || "",
      description: module.description || "",
      order: module.order || ""
    });
  };

  const saveModuleEdit = async (moduleId) => {
    try {
      await apiPut(`/admin/courses/${selectedCourseId}/modules/${moduleId}`, moduleEditForm);
      await loadCourses(selectedCourseId);
      setEditingModuleId("");
      setStatus("Module updated successfully.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const removeModule = async (moduleId) => {
    if (!window.confirm("Delete this module and all lessons inside it?")) {
      return;
    }

    try {
      await apiDelete(`/admin/courses/${selectedCourseId}/modules/${moduleId}`);
      await loadCourses(selectedCourseId);
      setStatus("Module deleted successfully.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const startEditLesson = (lesson) => {
    setEditingLessonId(lesson._id);
    setLessonEditForm({
      title: lesson.title || "",
      slug: lesson.slug || "",
      type: lesson.type || "video",
      sourceType: lesson.sourceType || "youtube",
      videoUrl: lesson.videoUrl || "",
      assetUrl: lesson.assetUrl || "",
      assetPublicId: lesson.assetPublicId || "",
      description: lesson.description || "",
      durationInMinutes: lesson.durationInMinutes || "",
      order: lesson.order || "",
      extractedText: lesson.extractedText || "",
      isPreview: Boolean(lesson.isPreview)
    });
  };

  const saveLessonEdit = async (moduleId, lessonId) => {
    try {
      await apiPut(`/admin/courses/${selectedCourseId}/modules/${moduleId}/lessons/${lessonId}`, lessonEditForm);
      await loadCourses(selectedCourseId);
      setEditingLessonId("");
      setStatus("Lesson updated successfully.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const removeLesson = async (moduleId, lessonId) => {
    if (!window.confirm("Delete this lesson?")) {
      return;
    }

    try {
      await apiDelete(`/admin/courses/${selectedCourseId}/modules/${moduleId}/lessons/${lessonId}`);
      await loadCourses(selectedCourseId);
      setStatus("Lesson deleted successfully.");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="admin-page">
      <div className="container py-5">
        {status ? (
          <div className="alert alert-secondary admin-floating-alert">
            <div className="d-flex justify-content-between align-items-center gap-3">
              <span>{status}</span>
              <button className="btn btn-sm btn-outline-dark" type="button" onClick={() => setStatus("")}>
                Dismiss
              </button>
            </div>
          </div>
        ) : null}
        <div className="admin-hero mb-4">
          <div>
            <span className="eyebrow">Admin Workspace</span>
            <h1 className="fw-bold mt-3 mb-2">Build your course in 3 simple steps</h1>
            <p className="text-secondary mb-0 admin-hero-copy">
              This page helps you create a course, organise it into modules, and then add learner-facing
              lessons like videos, documents, quizzes, and assignments.
            </p>
          </div>
          <div className="admin-course-picker">
            <label className="form-label fw-semibold mb-2">Current course</label>
            <select
              className="form-select admin-select"
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value);
                const course = courses.find((item) => item._id === event.target.value);
                setSelectedModuleId(course?.modules?.[0]?._id || "");
              }}
            >
              <option value="">Create a new course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-steps mb-4">
          <div className="admin-step-card active">
            <div className="admin-step-number">1</div>
            <div>
              <div className="fw-bold">Create or edit a course</div>
              <div className="small text-secondary">Set the course title, landing-page content, price, and publish status.</div>
            </div>
          </div>
          <div className={`admin-step-card ${selectedCourse ? "active" : ""}`}>
            <div className="admin-step-number">2</div>
            <div>
              <div className="fw-bold">Add modules</div>
              <div className="small text-secondary">Modules are sections like “Orientation”, “Accounting Basics”, or “Case Studies”.</div>
            </div>
          </div>
          <div className={`admin-step-card ${selectedModule ? "active" : ""}`}>
            <div className="admin-step-number">3</div>
            <div>
              <div className="fw-bold">Add lessons inside a module</div>
              <div className="small text-secondary">Lessons are the actual items learners open in the LMS.</div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-5">
            <div className="application-card h-100 admin-panel-card">
              <div className="admin-panel-head">
                <h3 className="fw-bold mb-1">{selectedCourse ? "Step 1: Edit Course Details" : "Step 1: Create a New Course"}</h3>
                <p className="text-secondary mb-0">
                  This controls the public course page and the basic course information learners see.
                </p>
              </div>
              <form className="row g-3" onSubmit={selectedCourse ? handleUpdateCourse : handleCreateCourse}>
                <div className="col-12">
                  <label className="form-label fw-semibold">Course title</label>
                  <input className="form-control" placeholder="Example: UG Program in Finance and Business" value={courseForm.title} onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))} required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Slug</label>
                  <input className="form-control" placeholder="Optional. Used in the course URL." value={courseForm.slug} onChange={(event) => setCourseForm((current) => ({ ...current, slug: event.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Short description</label>
                  <textarea className="form-control" rows="3" placeholder="A brief summary for cards and quick previews." value={courseForm.shortDescription} onChange={(event) => setCourseForm((current) => ({ ...current, shortDescription: event.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Hero description</label>
                  <textarea className="form-control" rows="4" placeholder="A richer marketing description for the landing page hero." value={courseForm.heroDescription} onChange={(event) => setCourseForm((current) => ({ ...current, heroDescription: event.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Course fee</label>
                  <input className="form-control" type="number" placeholder="500" value={courseForm.price} onChange={(event) => setCourseForm((current) => ({ ...current, price: event.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category</label>
                  <input className="form-control" placeholder="Undergraduate Program" value={courseForm.category} onChange={(event) => setCourseForm((current) => ({ ...current, category: event.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Duration</label>
                  <input className="form-control" placeholder="36 Months" value={courseForm.durationLabel} onChange={(event) => setCourseForm((current) => ({ ...current, durationLabel: event.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Mode</label>
                  <input className="form-control" placeholder="On Campus / Online / Hybrid" value={courseForm.modeLabel} onChange={(event) => setCourseForm((current) => ({ ...current, modeLabel: event.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Eligibility</label>
                  <input className="form-control" placeholder="12th Pass" value={courseForm.eligibilityLabel} onChange={(event) => setCourseForm((current) => ({ ...current, eligibilityLabel: event.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Highlights</label>
                  <textarea className="form-control" rows="4" placeholder="One highlight per line. These appear as landing-page cards." value={courseForm.highlights} onChange={(event) => setCourseForm((current) => ({ ...current, highlights: event.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Outcomes</label>
                  <textarea className="form-control" rows="4" placeholder="One outcome per line. These explain what the learner gains." value={courseForm.outcomes} onChange={(event) => setCourseForm((current) => ({ ...current, outcomes: event.target.value }))} />
                </div>
                <div className="col-12 form-check ms-1">
                  <input className="form-check-input" type="checkbox" id="coursePublished" checked={courseForm.isPublished} onChange={(event) => setCourseForm((current) => ({ ...current, isPublished: event.target.checked }))} />
                  <label className="form-check-label" htmlFor="coursePublished">
                    Publish this course so learners can access the landing page
                  </label>
                </div>
                <div className="col-12">
                  <button className="btn btn-dark w-100" type="submit">
                    {selectedCourse ? "Save Course Details" : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-xl-7">
            <div className="row g-4">
              <div className="col-12">
                <div className="application-card admin-panel-card">
                  <div className="admin-panel-head">
                    <h3 className="fw-bold mb-1">Step 2: Add a Module</h3>
                    <p className="text-secondary mb-0">
                      Modules help you group lessons into meaningful sections. A learner will see modules in the LMS sidebar.
                    </p>
                  </div>
                  <form className="row g-3" onSubmit={handleAddModule}>
                    <div className="col-md-5">
                      <label className="form-label fw-semibold">Module title</label>
                      <input className="form-control" placeholder="Example: Orientation" value={moduleForm.title} onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))} required />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label fw-semibold">Module description</label>
                      <input className="form-control" placeholder="What is covered in this module?" value={moduleForm.description} onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label fw-semibold">Order</label>
                      <input className="form-control" type="number" placeholder="1" value={moduleForm.order} onChange={(event) => setModuleForm((current) => ({ ...current, order: event.target.value }))} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-outline-dark" type="submit">
                        Add Module
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-12">
                <div className="application-card admin-panel-card">
                  <div className="admin-panel-head admin-panel-head-row">
                    <div>
                      <h3 className="fw-bold mb-1">Step 3: Add a Lesson</h3>
                      <p className="text-secondary mb-0">
                        Lessons are the actual items learners open. Choose a module first, then decide what kind of lesson you want to create.
                      </p>
                    </div>
                    <div className="admin-target-box">
                      <label className="form-label fw-semibold mb-2">Target module</label>
                      <select className="form-select admin-select" value={selectedModuleId} onChange={(event) => setSelectedModuleId(event.target.value)}>
                        <option value="">Select module</option>
                        {(selectedCourse?.modules || []).map((module) => (
                          <option key={module._id} value={module._id}>
                            {module.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-callout mb-4">
                    <div className="fw-semibold">Current selection</div>
                    <div className="text-secondary small">
                      Course: {selectedCourse?.title || "No course selected"} | Module: {selectedModule?.title || "No module selected"}
                    </div>
                  </div>

                  <form className="row g-3" onSubmit={handleAddLesson}>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Lesson title</label>
                      <input className="form-control" placeholder="Example: Welcome to the program" value={lessonForm.title} onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))} required />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Lesson type</label>
                      <select className="form-select" value={lessonForm.type} onChange={(event) => setLessonForm((current) => ({ ...current, type: event.target.value }))}>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Source type</label>
                      <select className="form-select" value={lessonForm.sourceType} onChange={(event) => setLessonForm((current) => ({ ...current, sourceType: event.target.value }))}>
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="cloudinary">Cloudinary</option>
                        <option value="upload">Uploaded File</option>
                        <option value="external">External URL</option>
                        <option value="richtext">Rich Text</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <div className="admin-tip-grid">
                        <div className="admin-tip-card">
                          <div className="fw-semibold">What this lesson type means</div>
                          <div className="small text-secondary">{lessonTypeHelp[lessonForm.type]}</div>
                        </div>
                        <div className="admin-tip-card">
                          <div className="fw-semibold">What this source type means</div>
                          <div className="small text-secondary">{sourceTypeHelp[lessonForm.sourceType]}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Lesson slug</label>
                      <input className="form-control" placeholder="Optional. Used if you later add lesson-level URLs." value={lessonForm.slug} onChange={(event) => setLessonForm((current) => ({ ...current, slug: event.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Video URL / embed URL</label>
                      <input className="form-control" placeholder="Use for YouTube, Vimeo, or external video links" value={lessonForm.videoUrl} onChange={(event) => setLessonForm((current) => ({ ...current, videoUrl: event.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Asset URL</label>
                      <input className="form-control" placeholder="Auto-filled after upload, or paste an existing hosted file URL" value={lessonForm.assetUrl} onChange={(event) => setLessonForm((current) => ({ ...current, assetUrl: event.target.value }))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Asset public ID</label>
                      <input className="form-control" placeholder="Cloudinary public ID or stored asset key" value={lessonForm.assetPublicId} onChange={(event) => setLessonForm((current) => ({ ...current, assetPublicId: event.target.value }))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Duration (minutes)</label>
                      <input className="form-control" type="number" placeholder="30" value={lessonForm.durationInMinutes} onChange={(event) => setLessonForm((current) => ({ ...current, durationInMinutes: event.target.value }))} />
                    </div>

                    <div className="col-12">
                      <div className="admin-upload-box">
                        <div>
                          <div className="fw-semibold">Optional: upload a file</div>
                          <div className="small text-secondary">
                            Upload a document or hosted asset here. TXT, MD, PDF, and DOCX files can be converted into readable text for AI summaries.
                          </div>
                        </div>
                        <div className="row g-3 mt-1">
                          <div className="col-md-8">
                            <input className="form-control" type="file" onChange={(event) => setAssetFile(event.target.files?.[0] || null)} />
                          </div>
                          <div className="col-md-4 d-grid">
                            <button className="btn btn-outline-dark" type="button" onClick={handleUploadAsset} disabled={uploadingAsset}>
                              {uploadingAsset ? "Uploading..." : "Upload File"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-9">
                      <label className="form-label fw-semibold">Lesson description</label>
                      <textarea className="form-control" rows="3" placeholder="What should the learner expect in this lesson?" value={lessonForm.description} onChange={(event) => setLessonForm((current) => ({ ...current, description: event.target.value }))} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Order</label>
                      <input className="form-control" type="number" placeholder="1" value={lessonForm.order} onChange={(event) => setLessonForm((current) => ({ ...current, order: event.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Document text / notes for AI summary</label>
                      <textarea className="form-control" rows="5" placeholder="Paste lesson text here if this is a document lesson or if you want learners to use the AI summary button." value={lessonForm.extractedText} onChange={(event) => setLessonForm((current) => ({ ...current, extractedText: event.target.value }))} />
                      <div className="small text-secondary mt-2">
                        Best practice: for a document lesson, either upload a readable document file or paste the key notes here. The learner’s `Summarise with AI` button uses this text.
                      </div>
                    </div>
                    <div className="col-12 form-check ms-1">
                      <input className="form-check-input" type="checkbox" id="lessonPreview" checked={lessonForm.isPreview} onChange={(event) => setLessonForm((current) => ({ ...current, isPreview: event.target.checked }))} />
                      <label className="form-check-label" htmlFor="lessonPreview">
                        Mark as preview lesson so learners can access it before full payment
                      </label>
                    </div>
                    <div className="col-12">
                      <button className="btn btn-danger" type="submit">
                        Add Lesson to Module
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-12">
                <div className="application-card admin-panel-card">
                  <div className="admin-panel-head">
                    <h3 className="fw-bold mb-1">Course Structure Preview</h3>
                    <p className="text-secondary mb-0">
                      This is how your course is currently organised. Use it to check ordering and content coverage.
                    </p>
                  </div>
                  {selectedCourse ? (
                    <div className="admin-outline">
                      {selectedCourse.modules.length ? (
                        selectedCourse.modules.map((module) => (
                          <div key={module._id} className="admin-outline-block">
                            {editingModuleId === module._id ? (
                              <div className="row g-3 mb-3">
                                <div className="col-md-5">
                                  <label className="form-label fw-semibold">Module title</label>
                                  <input className="form-control" value={moduleEditForm.title} onChange={(event) => setModuleEditForm((current) => ({ ...current, title: event.target.value }))} />
                                </div>
                                <div className="col-md-5">
                                  <label className="form-label fw-semibold">Description</label>
                                  <input className="form-control" value={moduleEditForm.description} onChange={(event) => setModuleEditForm((current) => ({ ...current, description: event.target.value }))} />
                                </div>
                                <div className="col-md-2">
                                  <label className="form-label fw-semibold">Order</label>
                                  <input className="form-control" type="number" value={moduleEditForm.order} onChange={(event) => setModuleEditForm((current) => ({ ...current, order: event.target.value }))} />
                                </div>
                                <div className="col-12 d-flex flex-wrap gap-2">
                                  <button className="btn btn-dark btn-sm" type="button" onClick={() => saveModuleEdit(module._id)}>
                                    Save Module
                                  </button>
                                  <button className="btn btn-outline-dark btn-sm" type="button" onClick={() => setEditingModuleId("")}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="admin-outline-head">
                                <div>
                                  <div className="fw-bold">{module.order}. {module.title}</div>
                                  <div className="text-secondary small">{module.description || "No description added yet."}</div>
                                </div>
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <span className="badge text-bg-light">{module.lessons.length} lessons</span>
                                  <button className="btn btn-sm btn-outline-dark" type="button" onClick={() => startEditModule(module)}>
                                    Edit
                                  </button>
                                  <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => removeModule(module._id)}>
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="mt-3">
                              {module.lessons.length ? (
                                module.lessons.map((lesson) => (
                                  <div key={lesson._id} className="admin-lesson-row">
                                    {editingLessonId === lesson._id ? (
                                      <div className="admin-lesson-edit w-100">
                                        <div className="row g-3">
                                          <div className="col-md-6">
                                            <label className="form-label fw-semibold">Lesson title</label>
                                            <input className="form-control" value={lessonEditForm.title} onChange={(event) => setLessonEditForm((current) => ({ ...current, title: event.target.value }))} />
                                          </div>
                                          <div className="col-md-3">
                                            <label className="form-label fw-semibold">Type</label>
                                            <select className="form-select" value={lessonEditForm.type} onChange={(event) => setLessonEditForm((current) => ({ ...current, type: event.target.value }))}>
                                              <option value="video">Video</option>
                                              <option value="document">Document</option>
                                              <option value="assignment">Assignment</option>
                                              <option value="quiz">Quiz</option>
                                            </select>
                                          </div>
                                          <div className="col-md-3">
                                            <label className="form-label fw-semibold">Source</label>
                                            <select className="form-select" value={lessonEditForm.sourceType} onChange={(event) => setLessonEditForm((current) => ({ ...current, sourceType: event.target.value }))}>
                                              <option value="youtube">YouTube</option>
                                              <option value="vimeo">Vimeo</option>
                                              <option value="cloudinary">Cloudinary</option>
                                              <option value="upload">Uploaded File</option>
                                              <option value="external">External URL</option>
                                              <option value="richtext">Rich Text</option>
                                            </select>
                                          </div>
                                          <div className="col-md-8">
                                            <label className="form-label fw-semibold">Description</label>
                                            <input className="form-control" value={lessonEditForm.description} onChange={(event) => setLessonEditForm((current) => ({ ...current, description: event.target.value }))} />
                                          </div>
                                          <div className="col-md-2">
                                            <label className="form-label fw-semibold">Order</label>
                                            <input className="form-control" type="number" value={lessonEditForm.order} onChange={(event) => setLessonEditForm((current) => ({ ...current, order: event.target.value }))} />
                                          </div>
                                          <div className="col-md-2">
                                            <label className="form-label fw-semibold">Minutes</label>
                                            <input className="form-control" type="number" value={lessonEditForm.durationInMinutes} onChange={(event) => setLessonEditForm((current) => ({ ...current, durationInMinutes: event.target.value }))} />
                                          </div>
                                          <div className="col-12 d-flex flex-wrap gap-2">
                                            <button className="btn btn-dark btn-sm" type="button" onClick={() => saveLessonEdit(module._id, lesson._id)}>
                                              Save Lesson
                                            </button>
                                            <button className="btn btn-outline-dark btn-sm" type="button" onClick={() => setEditingLessonId("")}>
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div>
                                          <div className="fw-semibold">{lesson.order}. {lesson.title}</div>
                                          <div className="small text-secondary">{lesson.description || "No description"}</div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                          <span className="badge text-bg-light">{lesson.type} / {lesson.sourceType}</span>
                                          <button className="btn btn-sm btn-outline-dark" type="button" onClick={() => startEditLesson(lesson)}>
                                            Edit
                                          </button>
                                          <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => removeLesson(module._id, lesson._id)}>
                                            Delete
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-secondary small">No lessons in this module yet.</div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-secondary">No modules added yet. Start by creating your first module above.</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-secondary">Create or select a course to start building content.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
