import api from "./api";

//  Get all events
export const getAllEvents = () => api.get("/events");

// Get event by ID
export const getEventById = (id) => api.get(`/events/${id}`);

// Get events by organizer
export const getEventsByOrganizer = (organizerId) =>
  api.get(`/events/organizer/${organizerId}`);

// Create event
export const createEvent = (eventData) =>
  api.post("/events", eventData);

// Update event
export const updateEvent = (id, eventData) =>
  api.put(`/events/${id}`, eventData);

// Delete event
export const deleteEvent = (id) =>
  api.delete(`/events/${id}`);

// Get volunteer requests for event
export const getRequestsByEvent = (eventId) =>
  api.get(`/events/${eventId}/requests`);