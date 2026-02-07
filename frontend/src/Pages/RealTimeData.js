  import { useState } from "react";
  import React, { useEffect } from "react";
  import { connection } from "../signalr";
  
  function RealTimeData(){
    const [value, setValue] = useState(0);

    useEffect(() => {
        connection.start()
        .then(() => console.log("Connected to SignalR"))
        .catch(err => console.error(err));

        connection.on("ReceiveData", (data) => {
        setValue(data);
        });

        return () => {
        connection.off("ReceiveData");
        };
    }, []);

    return (
        <div style={{ padding: "40px" }}>
        <h1>Real-Time Dashboard</h1>
        <h2>Value from server: {value}</h2>
        </div>
    );
}

export default RealTimeData;