
const sharp = require("sharp");

const COLOR_COUNT = 8;
const SAMPLE_SIZE = 100;

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((value) =>
        Math.round(value)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
      .toUpperCase()
  );
}

function distance(color1, color2) {
  return Math.sqrt(
    (color1.r - color2.r) ** 2 +
    (color1.g - color2.g) ** 2 +
    (color1.b - color2.b) ** 2
  );
}

function getRandomPixel(pixels) {
  return pixels[Math.floor(Math.random() * pixels.length)];
}

function initializeCentroids(pixels, count) {
  const centroids = [getRandomPixel(pixels)];

  while (centroids.length < count) {
    const distances = pixels.map((pixel) => {
      return Math.min(
        ...centroids.map((centroid) =>
          distance(pixel, centroid)
        )
      );
    });

    const total = distances.reduce(
      (sum, value) => sum + value ** 2,
      0
    );

    let random = Math.random() * total;
    let selected = pixels[0];

    for (let i = 0; i < pixels.length; i++) {
      random -= distances[i] ** 2;

      if (random <= 0) {
        selected = pixels[i];
        break;
      }
    }

    centroids.push({ ...selected });
  }

  return centroids;
}

function extractPixels(data) {
  const pixels = [];

  for (let i = 0; i < data.length; i += 3) {
    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    });
  }

  return pixels;
}

function runKMeans(pixels, count, maxIterations = 20) {
  let centroids = initializeCentroids(pixels, count);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const clusters = Array.from(
      { length: count },
      () => []
    );

    for (const pixel of pixels) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      centroids.forEach((centroid, index) => {
        const currentDistance = distance(pixel, centroid);

        if (currentDistance < minDistance) {
          minDistance = currentDistance;
          nearestIndex = index;
        }
      });

      clusters[nearestIndex].push(pixel);
    }

    centroids = centroids.map((centroid, index) => {
      const cluster = clusters[index];

      if (!cluster.length) {
        return centroid;
      }

      const total = cluster.reduce(
        (result, pixel) => ({
          r: result.r + pixel.r,
          g: result.g + pixel.g,
          b: result.b + pixel.b,
        }),
        { r: 0, g: 0, b: 0 }
      );

      return {
        r: total.r / cluster.length,
        g: total.g / cluster.length,
        b: total.b / cluster.length,
      };
    });
  }

  return centroids;
}

async function extractColors(imageBuffer) {
  if (!Buffer.isBuffer(imageBuffer) || !imageBuffer.length) {
    throw new Error("A valid image Buffer is required.");
  }

  const { data, info } = await sharp(imageBuffer)
    .resize(SAMPLE_SIZE, SAMPLE_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .flatten({ background: "#FFFFFF" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = extractPixels(data);

  if (!pixels.length) {
    throw new Error("No pixels found in image.");
  }

  const centroids = runKMeans(
    pixels,
    Math.min(COLOR_COUNT, pixels.length)
  );

  return centroids.map((color) =>
    rgbToHex(color.r, color.g, color.b)
  );
}

module.exports = extractColors;
