// Utility functions for room type handling

export const getRoomTypeEnglish = (type: string): string => {
  const englishNames: Record<string, string> = {
    STANDARD: 'Standard',
    SUPERIOR: 'Superior', 
    DELUXE: 'Deluxe',
    FAMILY: 'Family',
    HOP_IN: 'Hop In',
    ZENITH: 'Zenith'
  };
  return englishNames[type] || type;
};

export const getRoomTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    STANDARD: '🏨',
    SUPERIOR: '⭐',
    DELUXE: '💎', 
    FAMILY: '👨‍👩‍👧‍👦',
    HOP_IN: '🎒',
    ZENITH: '👑'
  };
  return icons[type] || '🏨';
};

export const getRoomTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    STANDARD: '#4f46e5',
    SUPERIOR: '#059669',
    DELUXE: '#dc2626',
    FAMILY: '#7c2d12',
    HOP_IN: '#ea580c', 
    ZENITH: '#7c3aed'
  };
  return colors[type] || '#6b7280';
};