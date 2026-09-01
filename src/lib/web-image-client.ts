"use client";

/** Browser file picker: any common raster plus SVG. Conversion picks WebP, PNG, or SVG. */
export const WEB_IMAGE_ACCEPT =
  "image/*,.heic,.heif,.svg,.tif,.tiff,.avif,.bmp,.gif,.jfif";

export type WebImageFormat = "webp" | "png" | "svg";

export type WebImageResult = {
  blob: Blob;
  mime: "image/webp" | "image/png" | "image/svg+xml";
  extension: WebImageFormat;
  width: number;
  height: number;
  formatLabel: string;
};

const SVG_MIME = "image/svg+xml";
const WEBP_QUALITY = 0.84;

function extensionOf(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  return fromName.replace(/jpe?g/, "jpg");
}

function isSvgFile(file: File) {
  const type = file.type.toLowerCase();
  return type === SVG_MIME || type === "image/svg" || extensionOf(file) === "svg";
}

function looksLikeImage(file: File) {
  if (file.type.startsWith("image/")) return true;
  return /^(png|jpg|jpeg|jfif|webp|gif|bmp|tif|tiff|heic|heif|avif|svg|ico)$/.test(extensionOf(file));
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function sampleHasAlpha(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const stepX = Math.max(1, Math.floor(width / 48));
  const stepY = Math.max(1, Math.floor(height / 48));
  const data = ctx.getImageData(0, 0, width, height).data;
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      if (data[(y * width + x) * 4 + 3] < 250) return true;
    }
  }
  return false;
}

async function decodeToBitmap(file: File): Promise<{ width: number; height: number; draw: (ctx: CanvasRenderingContext2D, dx: number, dy: number, dw: number, dh: number) => void; close: () => void }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, dx, dy, dw, dh) => ctx.drawImage(bitmap, dx, dy, dw, dh),
      close: () => bitmap.close(),
    };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("decode"));
        element.src = url;
      });
      return {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        draw: (ctx, dx, dy, dw, dh) => ctx.drawImage(image, dx, dy, dw, dh),
        close: () => URL.revokeObjectURL(url),
      };
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
  }
}

async function svgAsBlob(file: File): Promise<WebImageResult> {
  const text = await file.text();
  if (/<script[\s>/]|on\w+\s*=|javascript:/i.test(text)) {
    throw new Error("This SVG contains script. Export it as PNG or WebP instead.");
  }
  const blob = new Blob([text], { type: SVG_MIME });
  return {
    blob,
    mime: SVG_MIME,
    extension: "svg",
    width: 0,
    height: 0,
    formatLabel: "SVG",
  };
}

export async function convertForWebsite(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    canvasWidth?: number;
    canvasHeight?: number;
    background?: string;
    keepSvg?: boolean;
  } = {},
): Promise<WebImageResult> {
  if (!looksLikeImage(file)) {
    throw new Error("Use a photo or graphic (JPG, PNG, HEIC, WebP, TIFF, SVG, and similar).");
  }

  if (options.keepSvg !== false && isSvgFile(file)) {
    return svgAsBlob(file);
  }

  let source;
  try {
    source = await decodeToBitmap(file);
  } catch {
    throw new Error(
      "This browser could not read that file. Try JPG, PNG or WebP — or open this page in Safari for HEIC.",
    );
  }

  if (!source.width || !source.height) {
    source.close();
    throw new Error("That file has no image data.");
  }

  const maxWidth = options.canvasWidth ?? options.maxWidth ?? 1920;
  const maxHeight = options.canvasHeight ?? options.maxHeight ?? 1440;
  const exact = Boolean(options.canvasWidth && options.canvasHeight);

  let drawWidth: number;
  let drawHeight: number;
  let canvasWidth: number;
  let canvasHeight: number;

  if (exact) {
    canvasWidth = options.canvasWidth as number;
    canvasHeight = options.canvasHeight as number;
    const scale = Math.min(canvasWidth / source.width, canvasHeight / source.height);
    drawWidth = Math.max(1, Math.round(source.width * scale));
    drawHeight = Math.max(1, Math.round(source.height * scale));
  } else {
    const scale = Math.min(1, maxWidth / source.width, maxHeight / source.height);
    drawWidth = Math.max(1, Math.round(source.width * scale));
    drawHeight = Math.max(1, Math.round(source.height * scale));
    canvasWidth = drawWidth;
    canvasHeight = drawHeight;
  }

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    source.close();
    throw new Error("Could not prepare the image.");
  }

  const sourceMayHaveAlpha =
    isSvgFile(file) || /png|webp|gif|tif|svg|avif/.test(file.type.toLowerCase() || extensionOf(file));

  if (options.background && !sourceMayHaveAlpha) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  const dx = exact ? Math.round((canvasWidth - drawWidth) / 2) : 0;
  const dy = exact ? Math.round((canvasHeight - drawHeight) / 2) : 0;
  source.draw(ctx, dx, dy, drawWidth, drawHeight);
  source.close();

  const hasAlpha = sampleHasAlpha(ctx, canvasWidth, canvasHeight);
  const webp = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  const png = hasAlpha || !webp ? await canvasToBlob(canvas, "image/png") : null;

  let chosen: { blob: Blob; extension: "webp" | "png"; mime: "image/webp" | "image/png"; formatLabel: string };

  if (webp && png) {
    const preferPng = png.size + 2048 < webp.size;
    chosen = preferPng
      ? { blob: png, extension: "png", mime: "image/png", formatLabel: "PNG" }
      : { blob: webp, extension: "webp", mime: "image/webp", formatLabel: "WebP" };
  } else if (webp) {
    chosen = { blob: webp, extension: "webp", mime: "image/webp", formatLabel: "WebP" };
  } else if (png) {
    chosen = { blob: png, extension: "png", mime: "image/png", formatLabel: "PNG" };
  } else {
    throw new Error("Could not convert that image for the website.");
  }

  return {
    ...chosen,
    width: canvasWidth,
    height: canvasHeight,
  };
}

export function formatWebImageSize(image: Pick<WebImageResult, "width" | "height" | "formatLabel">) {
  if (!image.width || !image.height) return image.formatLabel;
  return `${image.formatLabel} · ${image.width} × ${image.height} px`;
}
