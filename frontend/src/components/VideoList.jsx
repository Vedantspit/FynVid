import { Link } from "react-router-dom";

export default function VideoList({ videos }) {
  const items = Array.isArray(videos)
    ? videos
    : Array.isArray(videos?.data)
    ? videos.data
    : Array.isArray(videos?.docs)
    ? videos.docs
    : [];

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {items.map((video) => {
        const id = video?._id || video?.id;
        const thumb = video?.thumbnail || video?.thumbnailUrl;
        const title = video?.title || "Untitled";
        const ownerUsername =
          video?.owner?.userName ||
          video?.owner?.username ||
          video?.ownerName ||
          "";
        const views = video?.views || 0;

        return (
          <Link
            key={id}
            to={`/watch/${id}`}
            className="flex gap-3 p-2 hover:bg-gray-50 transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-40 h-24 rounded-lg overflow-hidden bg-gray-200 shrink-0">
              {thumb ? (
                <img
                  src={thumb}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Thumbnail
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 line-clamp-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {ownerUsername}
              </p>
              <p className="text-xs text-gray-500">{views} views</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
