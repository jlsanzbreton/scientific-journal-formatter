export function createAssetService() {
  const images = [];

  function addFiles(fileList) {
    const added = [];
    const files = Array.from(fileList ?? []);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const entry = { name: file.name, url };
      images.push(entry);
      added.push(entry);
    });
    return added;
  }

  function hasImages() {
    return images.length > 0;
  }

  function getImageByIndex(index) {
    return images[index] ?? null;
  }

  function getImages() {
    return [...images];
  }

  function releaseUrls(list) {
    list.forEach((asset) => {
      try {
        URL.revokeObjectURL(asset.url);
      } catch (error) {
        console.warn('[assets] Unable to revoke object URL', error);
      }
    });
  }

  function clear() {
    releaseUrls(images);
    images.length = 0;
  }

  function dispose() {
    clear();
  }

  return {
    addFiles,
    hasImages,
    getImageByIndex,
    getImages,
    clear,
    dispose,
  };
}
