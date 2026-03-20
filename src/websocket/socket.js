import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const connectSocket=(callback)=>{

  const socket=new SockJS("https://voicemeet.onrender.com/ws");

  const client=new Client({

    webSocketFactory:()=>socket,

    onConnect:()=>{

      client.subscribe("/topic/messages",(msg)=>{
        callback(JSON.parse(msg.body));
      });

    }

  });

  client.activate();

  return client;

}