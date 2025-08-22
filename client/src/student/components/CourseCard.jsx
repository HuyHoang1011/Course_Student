import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "./PaymentModal";
import "./CourseCard.css";

export default function CourseCard({
  course,
  onClick,                 // optional: custom view handler
  className = "",
  onEnrollmentSuccess,     // callback after paid enrollment
}) {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Debug: Log course data to see studentCount
  console.log('CourseCard received course:', course);
  console.log('Course stats:', course?.stats);
  console.log('Student count from stats:', course?.stats?.studentCount);
  console.log('Student count from course:', course?.studentCount);
  console.log('Full course object keys:', Object.keys(course || {}));
  console.log('Course stats keys:', Object.keys(course?.stats || {}));

  // ===== Derived data =====
  const imgSrc = useMemo(() => {
    const fromIntro = course?.introductionAssets?.find((a) => a.kind === "image")?.url;
    return fromIntro || course?.thumbnailUrl || course?.imageIntroduction || "";
  }, [course]);

  const isFree =
    course?.priceType === "free" || Number(course?.price || 0) === 0;

  const hasDiscount =
    !isFree &&
    course?.salePrice != null &&
    Number(course.salePrice) < Number(course.price);

  const currency = course?.currency || "AUD";
  const minutes = Math.floor((course?.stats?.totalDurationSec || 0) / 60);
  const instructorName =
    typeof course?.instructorId === "object"
      ? course.instructorId?.name
      : undefined;

  // Compute student count with fallbacks
  const studentCount = course?.stats?.studentCount || course?.studentCount || 0;

  // ===== Handlers =====
  const handleView = () => {
    if (onClick) return onClick(course._id);
    navigate(`/student/courses/${course._id}`);
  };

  const handleLearnNow = (e) => {
    e.stopPropagation();
    if (isFree) {
      navigate(`/student/courses/${course._id}`);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = (result) => {
    setIsEnrolled(true);
    onEnrollmentSuccess?.(result);
    navigate(`/student/courses/${course._id}`);
  };

  // ===== UI helpers =====
  const buttonText = isEnrolled
    ? "Continue Learning"
    : "Start Learning";

  return (
    <>
      <article className={`cc-card ${className}`} role="article" aria-label={course?.title} onClick={handleView}>
        {/* MEDIA */}
        <div className="cc-media">
          {imgSrc ? (
            <img className="cc-img" src={imgSrc} alt={course?.title || "Course"} />
          ) : (
            <div className="cc-img cc-img--placeholder" aria-hidden>
              <span>Course Preview</span>
            </div>
          )}

          {course?.level && (
            <span className={`cc-chip cc-level cc-level--${course.level}`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </span>
          )}
        </div>

        {/* BODY */}
        <div className="cc-body">
          <h3 className="cc-title" title={course?.title}>{course?.title}</h3>
          {course?.subtitle && <p className="cc-subtitle">{course?.subtitle}</p>}

          {/* Meta row */}
          <div className="cc-row">
            <div className="cc-meta">
              {course?.stats?.totalLessons > 0 && (
                <span className="cc-dot">📚 {course.stats.totalLessons}</span>
              )}
              {minutes > 0 && <span className="cc-dot">⏱ {minutes}m</span>}
              <span className="cc-dot">👥 {studentCount}</span>
            </div>
          </div>

          {/* Instructor */}
          {instructorName && (
            <div className="cc-instructor">
              <span className="cc-instructor-label">Instructor</span>
              <span className="cc-instructor-name">{instructorName}</span>
            </div>
          )}

          {/* FOOTER */}
          <div className="cc-footer" onClick={(e) => e.stopPropagation()}>
            <div className="cc-price">
              {isFree ? (
                <span className="cc-price-free">Free</span>
              ) : (
                <span className="cc-price-current">
                  {currency}${Number(course.price).toFixed(0)}
                </span>
              )}
            </div>

            <div className="cc-actions">
              <button
                className="cc-btn cc-btn--ghost"
                type="button"
                onClick={handleView}
                aria-label={`View details for ${course?.title}`}
              >
                Details
              </button>
              <button
                className={`cc-btn cc-btn--primary`}
                type="button"
                onClick={handleLearnNow}
                aria-label={buttonText}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Payment modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}