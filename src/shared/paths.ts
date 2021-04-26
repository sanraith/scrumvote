export const BASE_ROOM_API = "/api/room";
export const CREATE_ROOM_API_PART = "/create";
export const ROOM_INFO_API_PART = "/:roomId/info";
export const CREATE_POLL_API_PART = "/:roomId/poll/create";
export const VOTE_POLL_API_PART = "/:roomId/poll/:pollId/vote";
export const CANCEL_VOTE_API_PART = "/:roomId/poll/:pollId/cancelVote";
export const CLOSE_POLL_API_PART = "/:roomId/poll/:pollId/close";
export const REOPEN_POLL_API_PART = "/:roomId/poll/:pollId/reopen";
export const DELETE_POLL_API_PART = "/:roomId/poll/:pollId/delete";

export const CREATE_ROOM_API = BASE_ROOM_API + CREATE_ROOM_API_PART;
export const CREATE_POLL_API = BASE_ROOM_API + CREATE_POLL_API_PART;
export const ROOM_INFO_API = BASE_ROOM_API + ROOM_INFO_API_PART;
export const VOTE_POLL_API = BASE_ROOM_API + VOTE_POLL_API_PART;
export const CANCEL_VOTE_API = BASE_ROOM_API + CANCEL_VOTE_API_PART;
export const CLOSE_POLL_API = BASE_ROOM_API + CLOSE_POLL_API_PART;
export const REOPEN_POLL_API = BASE_ROOM_API + REOPEN_POLL_API_PART;
export const DELETE_POLL_API = BASE_ROOM_API + DELETE_POLL_API_PART;

export const ROOM_ID_PARAM = ":roomId";
export const POLL_ID_PARAM = ":pollId";
