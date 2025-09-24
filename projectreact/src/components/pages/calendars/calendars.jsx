import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import api from '../../api/axios';

function Calendars({
  calendarRef,
  onDatesSet,
  onDateClick,
  onEventClick,
  selectedCategories,
  searchText,
  calendarHeight,
  view
}) {

  const fetchApiEvents = (fetchInfo, successCallback, failureCallback) => {
    api.get('/api/calendars', {
      params: {
        start: fetchInfo.startStr.substring(0, 10), // YYYY-MM-DD
        end: fetchInfo.endStr.substring(0, 10),
      }
    })
      .then(response => {
        let events = response.data || [];
        const text = (searchText || '').trim().toLowerCase();

        const filteredEvents = events.filter(event => {
          const cat = event?.category ?? event?.extendedProps?.category;
          const categoryOK = selectedCategories.length === 0 || (cat && selectedCategories.includes(cat));

          const textOK = !text || (event && (event.title || '').toLowerCase().includes(text));
          return categoryOK && textOK;
        });

        const formattedEvents = filteredEvents.map(event => ({
          id: event.id,
          title: event.title || '제목 없음',
          start: event.start,
          end: event.end,
          allDay: event.allDay ?? true,
          backgroundColor: event.backgroundColor,
          borderColor: event.borderColor,
          extendedProps: {
            category: event.category ?? event.extendedProps?.category,
            content: event.extendedProps?.content,
            isShift: event.isShift ?? event.extendedProps?.isShift
          }
        }));

        successCallback(formattedEvents);
      })
      .catch(error => {
        console.error("일정 로딩 실패:", error);
        failureCallback(error);
      });
  };

  return (
    <FullCalendar
      key={JSON.stringify(selectedCategories) + searchText}
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={view}
      headerToolbar={false}
      locale={koLocale}
      height={calendarHeight}
      datesSet={onDatesSet}
      dateClick={onDateClick}
      eventClick={onEventClick}
      events={fetchApiEvents}
      editable={true}
      selectable={true}
      dayMaxEvents={true}
    />
  );
}

export default Calendars;
