import { DateTime } from 'luxon';

export const formatNow = (): string => {
  let now = DateTime.now();
  if (process.env.TIME_ZONE_OFFSET === undefined) {
    return `${now} (TIME_ZONE_OFFSET is not initialized)`;
  }
  now = now.plus({ hour: Number(process.env.TIME_ZONE_OFFSET) });
  const date = `${now.year}-${now.month.toString().padStart(2, '0')}-${now.day.toString().padStart(2, '0')}`;
  let hour: number = now.hour;
  let meridiem = 'A';

  if (now.hour === 0) {
    hour = 12;
  }

  if (now.hour > 12) {
    hour = now.hour - 12;
  }

  if (now.hour >= 12) {
    meridiem = 'P';
  }

  const time = `${hour.toString().padStart(2, '0')}:${now.minute.toString().padStart(2, '0')}:${now.second
    .toString()
    .padStart(2, '0')}`;
  return `${date} ${time}${meridiem}`;
};

export const terminalLog = (message: string): void => {
  const now = formatNow();
  console.log(`${now} | ${message}`);
};
