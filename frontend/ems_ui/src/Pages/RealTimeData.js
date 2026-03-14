  import { useState } from "react";
  import React, { useEffect } from "react";
  import { connection } from "../signalr";
  import { Line } from "react-chartjs-2";

  import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";
  ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);
  function RealTimeData(){
  const [showModal, setShowModal] = useState(false);
  const jsonData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    values: [[10, 20, 15, 30],[50,50,50,50]]
  };

const data = {
    labels: ["10:00", "10:05", "10:10", "10:15"],

    datasets: [
      {
        label: "Temperature",
        data: [27, 28, 29, 30],
        borderColor: "red",
        tension: 0.3
      },

      {
        label: "Humidity",
        data: [60, 62, 65, 64],
        borderColor: "blue",
        tension: 0.3
      }
    ]
  };
  

  const options = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: "Temperature Chart"
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

useEffect(()=>{


 let labels = {};
 let dataset = {};

 for(let i=0;i<3;i++){
  labels[i]=[];
  dataset[i]=[];
 }

 let G ={labels,dataset};

 G.labels[0].push(5.55,6.66);
 G.labels[1].push(5.55,6.66);
 G.labels[2].push(5.55,6.66);

  G.dataset[0].push("dd","bb");
 G.dataset[1].push("dd","bb");
 G.dataset[2].push("dd","bb");
 console.log(G);

},[]);

  return (
<div>
  <div className="card p-3">
      
      <Line data={data} />
    </div>
    <div className="card p-3">
     
      <Line data={data} options={options} />
    </div>
    </div>
  );

}

export default RealTimeData;