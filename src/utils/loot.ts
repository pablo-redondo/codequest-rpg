import type { Zone } from '../types/zone';

export function getLootItem(zone: Zone): string {
  return `${zone.icon} ${zone.name} Scroll`;
}
