import { DateTime } from 'luxon';
import { TurnType } from '../../models/enumeration/turn-type-enum';

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

export const terminalLog = (message: string, addendum?: string): void => {
  const now = formatNow();
  console.log(`${now} | ${message}${addendum ? ` | ${addendum}` : ''}`);
};

export const terminalAddendum = (event: string, message: string): void => {
  const eventMessage = event.padStart(20, ' ');
  console.log(`${eventMessage} | ${message}`);
};

export const formatTurnName = (turnType: TurnType, yearStylized: number): string => {
  const turnTypeSplit = turnType.split(' ');
  return `${turnTypeSplit[0]} ${yearStylized} ${turnTypeSplit[1]}`;
};
