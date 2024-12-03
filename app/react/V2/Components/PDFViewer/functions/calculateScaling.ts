const calculateScaling = (
  devicePixelRatio: number,
  pageWidth: number,
  parentWidth: number | undefined
) => {
  let widthRatio = 1;
  let adjustedScale = 1;

  if (parentWidth) {
    widthRatio = Math.max(parentWidth / pageWidth, 1);
  }

  if (devicePixelRatio >= 1) {
    adjustedScale = Math.min(1, widthRatio / devicePixelRatio);
  } else {
    adjustedScale = widthRatio * Math.max(devicePixelRatio, 0.5);
  }

  console.log(adjustedScale);

  return Math.max(adjustedScale, 0.5);
};

export { calculateScaling };
