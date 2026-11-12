(() => {
  const assetDirectory = new URL('assets/images/', document.baseURI).href;
  const retried = new WeakSet();

  function retry(image) {
    if (!(image instanceof HTMLImageElement) || retried.has(image)) return;
    const failedSource = image.currentSrc || image.src;
    if (!failedSource.startsWith(assetDirectory)) return;

    const retrySource = new URL(failedSource);
    retrySource.searchParams.set('retry', '1');

    // Keep the original width descriptors and other responsive candidates.
    const candidates = image.srcset.split(',').map(candidate => {
      const [source, ...descriptors] = candidate.trim().split(/\s+/);
      if (!source || new URL(source, document.baseURI).href !== failedSource) return candidate;
      return [retrySource.href, ...descriptors].join(' ');
    }).join(',');

    retried.add(image);
    if (candidates !== image.srcset) image.srcset = candidates;
    if (image.src === failedSource) image.src = retrySource.href;
  }

  document.addEventListener('error', event => retry(event.target), true);

  // An eager image can fail while the deferred script is still downloading.
  for (const image of document.images) {
    if (image.complete && !image.naturalWidth) retry(image);
  }
})();
