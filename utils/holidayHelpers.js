const DAY_MS = 24 * 60 * 60 * 1000; 

export const parseDate = (dateString) => new Date(dateString + 'T00:00:00');

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const daysBetween = (from, to) => Math.round((to - from) / DAY_MS);

const countWeekendDays = (start, end) => {
  let count = 0;
  const day = new Date(start);
  while (day <= end) {
    if (day.getDay() === 0 || day.getDay() === 6) count++; 
    day.setDate(day.getDate() + 1);
  }
  return count;
};

export const formatDateRange = (start, end) => {
  if (daysBetween(start, end) === 0) {
    return start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' });
  }
  const monthName = (date) => date.toLocaleDateString('en-GB', { month: 'long' });
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${monthName(end)}`;
  }
  return `${start.getDate()} ${monthName(start)} – ${end.getDate()} ${monthName(end)}`;
};

export const mergeConsecutiveHolidays = (holidays) => {
  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
  const merged = [];

  for (const holiday of sorted) {
    const date = parseDate(holiday.date);
    const last = merged[merged.length - 1];


    if (last && last.name === holiday.name && daysBetween(last.end, date) === 1) {
      last.end = date;
      last.days += 1;
    } else {
      merged.push({
        name: holiday.name,
        localName: holiday.localName,
        global: holiday.global,
        start: date,
        end: date,
        days: 1
      });
    }
  }
  return merged;
};

export const addHolidayDetails = (holidays) => {
  const today = getToday();

  return holidays.map(holiday => {
    const daysUntil = daysBetween(today, holiday.start);

    let status = 'upcoming';
    if (holiday.end < today) status = 'past';
    else if (holiday.start <= today) status = 'today';

    let relativeLabel;
    if (status === 'past') {
      const daysAgo = daysBetween(holiday.end, today);
      relativeLabel = daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;
    } else if (status === 'today') {
      relativeLabel = 'Today!';
    } else {
      relativeLabel = daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`;
    }

    return {
      ...holiday,
      formattedDate: formatDateRange(holiday.start, holiday.end),
      weekendDays: countWeekendDays(holiday.start, holiday.end),
      daysUntil,
      status,
      relativeLabel
    };
  });
};

export const groupByMonth = (holidays) => {
  const groups = [];
  for (const holiday of holidays) {
    const month = holiday.start.toLocaleDateString('en-GB', { month: 'long' });
    let group = groups.find(g => g.month === month);
    if (!group) {
      group = { month, holidays: [] };
      groups.push(group);
    }
    group.holidays.push(holiday);
  }
  return groups;
};

export const getSummary = (holidays) => ({
  totalHolidays: holidays.length,
  totalDays: holidays.reduce((sum, h) => sum + h.days, 0),
  weekendDays: holidays.reduce((sum, h) => sum + h.weekendDays, 0),
  upcomingCount: holidays.filter(h => h.status !== 'past').length,
  nextHoliday: holidays.find(h => h.status !== 'past') || null
});


export const processLongWeekends = (weekends, sortBy = 'date') => {
  const today = getToday();

  const processed = weekends.map(weekend => {
    const start = parseDate(weekend.startDate);
    const end = parseDate(weekend.endDate);

    
    const bridgeDays = (weekend.bridgeDays || []).map(day =>
      parseDate(day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    );

    return {
      start,
      end,
      formattedDate: formatDateRange(start, end),
      dayCount: weekend.dayCount,
      needBridgeDay: weekend.needBridgeDay,
      bridgeDays,
      isPast: end < today
    };
  });

  if (sortBy === 'length') {
   
    processed.sort((a, b) => b.dayCount - a.dayCount || a.start - b.start);
  } else {
    processed.sort((a, b) => a.start - b.start);
  }
  return processed;
};


export const getLongWeekendSummary = (weekends) => {
  if (weekends.length === 0) return null;

 
  const longest = weekends.reduce((max, w) => (w.dayCount > max.dayCount ? w : max));

  return {
    total: weekends.length,
    withoutBridge: weekends.filter(w => !w.needBridgeDay).length,
    withBridge: weekends.filter(w => w.needBridgeDay).length,
    longest
  };
};