const calculateScaling = (
  devicePixelRatio: number,
  pageWidth: number,
  parentWidth: number | undefined
) => {
  const widthRatio = parentWidth ? parentWidth / pageWidth : pageWidth;
  const adjustedScale =
    devicePixelRatio >= 1
      ? Math.min(1, widthRatio / devicePixelRatio)
      : widthRatio * Math.max(devicePixelRatio, 0.5);

  return adjustedScale;
};

export { calculateScaling };
