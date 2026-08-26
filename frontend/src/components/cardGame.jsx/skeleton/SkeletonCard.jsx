import "./Skeleton.css";

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
        <div className="skeleton-line skeleton-price"></div>
        <div className="skeleton-buttons">
          <div className="skeleton-btn"></div>
          <div className="skeleton-btn"></div>
        </div>
      </div>
    </div>
  );
}