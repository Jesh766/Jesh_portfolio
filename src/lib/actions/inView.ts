export function inView(
  node: HTMLElement,
  params: { id?: string; threshold?: number; once?: boolean; onEnter?: () => void } = {}
) {
  const threshold = params.threshold ?? 0.25;
  const once = params.once ?? true;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          params.onEnter?.();
          node.dispatchEvent(new CustomEvent('enter'));
          if (once) observer.unobserve(node);
        }
      }
    },
    { threshold }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}
