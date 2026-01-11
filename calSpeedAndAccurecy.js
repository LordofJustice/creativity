const calSpeedAndAccurecy = (typeCount, timeInMinutes, errorCount) => {
  const WPM = (typeCount / 5) / timeInMinutes;
  const Accuracy = Math.round(
    ((typeCount - errorCount) / typeCount) * 100,
    3,
  );
  return { WPM, Accuracy };
};
exports.calSpeedAndAccurecy = calSpeedAndAccurecy;
