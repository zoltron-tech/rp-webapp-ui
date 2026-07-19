import { LikeButton } from "rp-webapp";

const col: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  alignItems: "flex-start",
  padding: 20,
};

const noop = () => {};

export const NotLiked = () => (
  <div style={col}>
    <LikeButton parentId="prompt-4821" likes={12} onLike={noop} />
  </div>
);

export const Liked = () => (
  <div style={col}>
    <LikeButton parentId="prompt-4822" likes={27} liked onLike={noop} />
  </div>
);

export const CountsAndSubjects = () => (
  <div style={col}>
    <LikeButton parentId="comment-91" likes={0} onLike={noop} />
    <LikeButton parentId="comment-92" likes={1} onLike={noop} />
    <LikeButton parentId="ooc-post-17" likes={342} liked subject="writer" onLike={noop} />
  </div>
);

export const ReadOnlyLoggedOut = () => (
  <div style={col}>
    <LikeButton parentId="prompt-4823" likes={54} />
    <LikeButton parentId="prompt-4824" likes={8} liked />
  </div>
);
