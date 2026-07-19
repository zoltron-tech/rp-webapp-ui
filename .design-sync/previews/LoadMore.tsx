import { LoadMore } from "rp-webapp";

const wrap: React.CSSProperties = { padding: 20, maxWidth: 420 };

const noop = () => {};

export const Default = () => (
  <div style={wrap}>
    <LoadMore hasMore loadingMore={false} onLoadMore={noop} />
  </div>
);

export const Loading = () => (
  <div style={wrap}>
    <LoadMore hasMore loadingMore onLoadMore={noop} />
  </div>
);

export const WithUnreadCount = () => (
  <div style={wrap}>
    <LoadMore hasMore loadingMore={false} onLoadMore={noop} unreadCount={7} />
  </div>
);

export const UnreadOverflow = () => (
  <div style={wrap}>
    <LoadMore hasMore loadingMore={false} onLoadMore={noop} unreadCount={128} />
  </div>
);
