export async function toSquareDataURL(file: File): Promise<{ blob: Blob, mime: string, name: string }> {
  const img = await fileToImage(file);
  const size = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth  - size) / 2;
  const sy = (img.naturalHeight - size) / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
  const mime = file.type && file.type.startsWith('image/') ? file.type : 'image/png';
  const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), mime, 0.92));
  const name = (file.name || 'image').replace(/[^\w.\-]+/g,'_').replace(/\.(jpeg|jpg|png|gif)$/i,'') + '_square.png';
  return { blob, mime: 'image/png', name };
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = String(r.result);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
