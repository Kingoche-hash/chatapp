// A tiny counter: allows `limit` actions per `windowMs` for ONE socket.
export const createSocketLimiter = ({ limit, windowMs }) => {
  let hits = [];

  return () => {
    const now = Date.now();
    hits = hits.filter((time) => now - time < windowMs);

    if (hits.length >= limit) return false;

    hits.push(now);
    return true;
  };
};