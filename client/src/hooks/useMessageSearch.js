import { useCallback, useEffect, useState } from 'react';
import { searchMessagesRequest } from '../services/chat.service';
import { getErrorMessage } from '../utils/getErrorMessage';

const MIN_LENGTH = 2;

const emptyState = {
  results: [],
  hasMore: false,
  nextCursor: null,
  loading: false,
  error: '',
  searched: false,
};

export const useMessageSearch = ({ query, conversationId, senderId }) => {
  const term = query.trim();
  const active = term.length >= MIN_LENGTH;

  const [state, setState] = useState(emptyState);

  // Wait 400ms after the last key press, then search.
  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setState((prev) => ({ ...prev, loading: true, error: '' }));

      try {
        const data = await searchMessagesRequest({ q: term, conversationId, senderId });

        if (!cancelled) {
          setState({
            results: data.results,
            hasMore: data.hasMore,
            nextCursor: data.nextCursor,
            loading: false,
            error: '',
            searched: true,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(err), searched: true }));
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, term, conversationId, senderId]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const data = await searchMessagesRequest({
        q: term,
        conversationId,
        senderId,
        before: state.nextCursor,
      });

      setState((prev) => ({
        ...prev,
        results: [...prev.results, ...data.results],
        hasMore: data.hasMore,
        nextCursor: data.nextCursor,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(err) }));
    }
  }, [state.hasMore, state.loading, state.nextCursor, term, conversationId, senderId]);

  return {
    active,
    results: active ? state.results : [],
    hasMore: active && state.hasMore,
    loading: state.loading,
    error: active ? state.error : '',
    searched: state.searched,
    loadMore,
  };
};