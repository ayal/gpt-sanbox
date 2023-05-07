import "./styles.css";
const app = document.getElementById("root");
if (app) {
  app.innerHTML = `Eval Sandbox`;
}

interface IncomingMessage {
  command: string;
  code: string;
  origin: string;
  requestId: string;
  response: any;
}

interface OutgoingMessage {
  command: string;
  params: any[];
  origin: string;
  requestId: string;
}

interface World {
  [key: string]: {
    resolve: (value: any) => void;
    response: any;
  };
}

const world: World = {};

const UUID = () => {
  return Math.random().toString(36).substring(2, 15);
};

const sendMessage = (message: OutgoingMessage) => {
  console.log("Message sent to parent", message);
  const p = new Promise((resolve) => {
    world[message.requestId] = { resolve, response: null };
    window.parent.postMessage(message, "*");
  });
  return p;
};

const makeRequest = async ({
  url,
  method,
  headers,
  data,
}: {
  url: string;
  method: string;
  headers: any;
  data: any;
}) => {
  const res = await sendMessage({
    requestId: UUID(),
    origin: "eval-sandbox",
    command: "makeRequest",
    params: [
      {
        url,
        method,
        headers,
        data,
      },
    ],
  });
  console.log("send message res", res);
  return res;
};

// function that accepts messages from parent window and sends messages to parent window
const messageHandler = (event: MessageEvent) => {
  const message = event.data as IncomingMessage;
  console.log("Message received from parent", event.data);
  if (message.origin === "igor") {
    if (message.command === "eval") {
      eval(message.code);
    } else if (message.command === "response") {
      console.log(
        "Response received from parent",
        message.response,
        message.requestId
      );
      world[message.requestId].response = message.response;
      world[message.requestId].resolve(message.response);
    }
  }
};

// add event listener to receive messages from parent window
window.addEventListener("message", messageHandler, false);
