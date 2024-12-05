const calculateScaling = (
  devicePixelRatio: number,
  pageWidth: number,
  parentWidth: number | undefined
) => {
  let widthRatio = 1;
  let adjustedScale = 1;
  let minScale = 0.5;

  if (parentWidth) {
    widthRatio = Math.max(parentWidth / pageWidth, 1);

    if (parentWidth < 500) {
      minScale = 0.8;
    }
  }

  if (devicePixelRatio >= 1) {
    adjustedScale = Math.min(1, widthRatio / devicePixelRatio);
  } else {
    adjustedScale = widthRatio / (1 + devicePixelRatio);
  }

  return Math.max(adjustedScale, minScale);
};

export { calculateScaling };
