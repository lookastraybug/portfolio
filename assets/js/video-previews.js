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
  const containerSelector = '[data-portfolio-video]';
  const previews = new WeakMap();

  function showPreview(frame, preview, visible) {
    preview.hidden = !visible;
    frame.classList.toggle('portfolio-video-loading', visible);
  }

  function preparePlayer(container) {
    const id = container.dataset.portfolioVideo;
    const title = videoTitles[id];
    if (!title) return;

    let preview = container.querySelector('.portfolio-video-preview');
    if (!preview) {
      preview = document.createElement('a');
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
      container.append(preview);
    }

    const frame = container.querySelector(iframeSelector);
    if (!frame || previews.has(frame)) return;
    frame.title = title;
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
        const container = node.closest(containerSelector);
        if (container) preparePlayer(container);
        node.querySelectorAll(containerSelector).forEach(preparePlayer);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll(containerSelector).forEach(preparePlayer);
})();
