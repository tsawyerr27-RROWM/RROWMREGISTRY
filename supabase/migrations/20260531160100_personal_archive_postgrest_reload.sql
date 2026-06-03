-- If 20260531160000 was applied before the notify line was added, run this once.
-- Safe to re-run: only reloads the API schema cache.
notify pgrst, 'reload schema';
