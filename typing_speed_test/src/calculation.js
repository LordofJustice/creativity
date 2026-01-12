export const calculateWpmAndAccuracy = (
  typeCount,
  timeInMinutes,
  errorCount,
) => {
  const WPM = ((typeCount / 5) / timeInMinutes).toPrecision(4);
  const Accuracy = (((typeCount - errorCount) / typeCount) * 100)
    .toPrecision(3);
  return { WPM, Accuracy };
};
