(() => {
  const videoTitles = {
    '1006259239': 'Bala Solution',
    '1006558895': 'Togit Empathise & Discover',
    '1006622391': 'Togit Solution',
    '1007076833': 'Togit The Problem',
    '1018407437': 'Gharkharch Active Learning Game',
    '1018411348': 'Gharkharch',
    '1018411969': 'Puzzle Passive Learning Component',
    '1018414552': 'Bala App',
    '833523164': 'Togit Philips Service Design Challenge',
    '935726388': 'Bala',
  };
  const playerOrigin = 'https://player.vimeo.com';
  const iframeSelector = 'iframe[src^="https://player.vimeo.com/video/"]';
  const previews = new WeakMap();

  function showPreview(frame, preview, visible) {
    preview.hidden = !visible;
    frame.classList.toggle('portfolio-video-loading', visible);
  }

  function addPreview(frame) {
    if (previews.has(frame)) return;
    const id = new URL(frame.src).pathname.split('/')[2];
    const title = videoTitles[id];
    if (!title) return;

    const preview = document.createElement('a');
    preview.className = 'portfolio-video-preview';
    preview.href = 'https://vimeo.com/' + id;
    preview.target = '_blank';
    preview.rel = 'noopener';
    preview.setAttribute('aria-label', 'Watch ' + title + ' on Vimeo');

    const image = document.createElement('img');
    image.src = 'assets/images/video-previews/' + id + '.jpg';
    image.alt = '';
    image.loading = 'lazy';
    preview.append(image);

    frame.title = title;
    frame.after(preview);
    previews.set(frame, preview);
    showPreview(frame, preview, true);

    const ping = () => frame.contentWindow?.postMessage({ method: 'ping' }, playerOrigin);
    frame.addEventListener('load', ping);
    ping();
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== playerOrigin) return;
    let message = event.data;
    if (typeof message === 'string') {
      try {
        message = JSON.parse(message);
      } catch {
        return;
      }
    }
    const ready = message?.event === 'ready' || message?.method === 'ping';
    const failed = message?.event === 'error';
    if (!ready && !failed) return;

    for (const frame of document.querySelectorAll(iframeSelector)) {
      if (frame.contentWindow !== event.source) continue;
      const preview = previews.get(frame);
      if (preview) showPreview(frame, preview, failed);
      break;
    }
  });

  const observer = new MutationObserver((records) => {
    for (const { addedNodes } of records) {
      for (const node of addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(iframeSelector)) addPreview(node);
        node.querySelectorAll(iframeSelector).forEach(addPreview);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll(iframeSelector).forEach(addPreview);
})();
