// ==================================================
// SETUP
// ==================================================

export const socket = io();

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO SEND A MESSAGE TO THE SERVER
export function sendMessage(event, message) {
    socket.emit(event, message);
}
