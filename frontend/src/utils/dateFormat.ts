import { useTranslation } from 'react-i18next';

export interface DateFormatOptions {
  format?: 'short' | 'long' | 'full';
  locale?: string;
}

export const formatThaiDate = (
  date: Date | string,
  options: DateFormatOptions = {}
): string => {
  const { format = 'short', locale = 'th' } = options;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const buddhistYear = year + 543;

  const thaiMonths = {
    short: [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ],
    long: [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
  };

  const monthName = format === 'long' ? thaiMonths.long[month] : thaiMonths.short[month];

  switch (format) {
    case 'short':
      return `${day} ${monthName} ${buddhistYear}`;
    case 'long':
      return `${day} ${monthName} พ.ศ. ${buddhistYear}`;
    case 'full':
      const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
      const dayName = dayNames[dateObj.getDay()];
      return `วัน${dayName} ที่ ${day} ${monthName} พ.ศ. ${buddhistYear}`;
    default:
      return `${day} ${monthName} ${buddhistYear}`;
  }
};

export const formatDate = (
  date: Date | string,
  options: DateFormatOptions = {}
): string => {
  const { locale = 'en' } = options;
  
  if (locale === 'th') {
    return formatThaiDate(date, options);
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const { format = 'short' } = options;
  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();

  const englishMonths = {
    short: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    long: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  };

  const monthName = format === 'long' ? englishMonths.long[month] : englishMonths.short[month];

  switch (format) {
    case 'short':
      return `${monthName} ${day}, ${year}`;
    case 'long':
      return `${monthName} ${day}, ${year}`;
    case 'full':
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[dateObj.getDay()];
      return `${dayName}, ${monthName} ${day}, ${year}`;
    default:
      return `${monthName} ${day}, ${year}`;
  }
};

export const useDateFormat = () => {
  const { i18n } = useTranslation();
  
  return (date: Date | string, options: DateFormatOptions = {}) => {
    return formatDate(date, { ...options, locale: i18n.language });
  };
};