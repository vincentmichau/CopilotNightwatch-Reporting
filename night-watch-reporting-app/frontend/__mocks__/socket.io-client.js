// Mock simple de socket.io-client utilisé dans les tests
const createSocket = () => {
  const listeners = {};
  return {
    on: (event, cb) => {
      listeners[event] = cb;
    },
    off: (event) => {
      delete listeners[event];
    },
    emit: (event, payload) => {
      if (listeners[event]) listeners[event](payload);
    }
  };
};

module.exports = createSocket;
module.exports.default = createSocket;
