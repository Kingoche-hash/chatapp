// Holds the one Socket.io server so REST controllers can use it too.
let io = null;

export const setIO = (instance) => {
  io = instance;
};

export const getIO = () => io;