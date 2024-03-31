import { DateTime } from 'luxon';
import { TurnType } from '../../models/enumeration/turn-type-enum';

/**
 * Converts time into a yyyy-mm-dd hh:mm:ss formatted time string.
 * No argument defaults to now.
 * @returns yyyy-mm-dd hh:mm:ss formatted time string
 */
export const formatDateTime = (unformattedTime?: Date): string => {
  let dateTime = unformattedTime ? DateTime.fromISO(unformattedTime.toISOString()) : DateTime.now();
  if (process.env.TIME_ZONE_OFFSET === undefined) {
    return `${dateTime} (TIME_ZONE_OFFSET is not initialized)`;
  }
  dateTime = dateTime.plus({ hour: Number(process.env.TIME_ZONE_OFFSET) });
  const date = `${dateTime.year}-${dateTime.month.toString().padStart(2, '0')}-${dateTime.day
    .toString()
    .padStart(2, '0')}`;
  let hour: number = dateTime.hour;
  let meridiem = 'A';

  if (dateTime.hour === 0) {
    hour = 12;
  }

  if (dateTime.hour > 12) {
    hour = dateTime.hour - 12;
  }

  if (dateTime.hour >= 12) {
    meridiem = 'P';
  }

  const time = `${hour.toString().padStart(2, '0')}:${dateTime.minute.toString().padStart(2, '0')}:${dateTime.second
    .toString()
    .padStart(2, '0')}`;
  return `${date} ${time}${meridiem}`;
};

export const terminalLog = (message: string, addendum?: string): void => {
  const now = formatDateTime();
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

export const titleCase = (text: string): string => {
  const splitText = text.split(' ');
  const titleCaseText = splitText.map((word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return titleCaseText.join(' ');
};
