#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include "ESP8266WebServer.h"
#include <ESP8266HTTPClient.h>
const char* ssid = "GHOST 5514";
const char* password = "12345678";

ESP8266WebServer server(80);
String res = "";
int code=0;
String messageText="";
SoftwareSerial sim800(12, 14); // RX,TX -- D6,D5
String sms = "";
String data = "";
String rep = "";
bool module_status = false;
void sendACK(int ack){
  sim800.println("AT+CMGF=1");
  delay(1000);
  sim800.println("AT+CSCS=\"GSM\"");
  delay(1000);
  sim800.println("AT+CMGS=\"+94756982620\"");
  delay(1000);
  messageText = String(ack);
  sim800.print(messageText);
  delay(500);
  sim800.write(26); 
  delay(5000);

  sim800.println("ATE0");
  sim800.println("AT+CMGF=1");
  delay(500);
  sim800.println("AT+CPMS=\"SM\",\"SM\",\"SM\"");
  delay(500);
  sim800.println("AT+CNMI=2,1,0,0,0");
  delay(500);


}
int sendDataToServer(String data) {
  if (WiFi.status() == WL_CONNECTED){
    WiFiClient client;
    HTTPClient http;

    http.begin(client, "http://192.168.43.183:5000/Data/sendunitdata");
    http.addHeader("Content-Type", "application/json");

    
    data.trim();

    code = http.POST(data.c_str());
    if(code == 200){
      sendACK(code);
    }
    String response = http.getString();
    Serial.println("HTTP Response : "+response);
    http.end();
  }
  return code;
}

void readSMS(int index){
 
  
      sim800.println("ATE0");
      sim800.println("AT+CMGF=1");
      delay(500);
      sim800.println("AT+CPMS=\"SM\",\"SM\",\"SM\"");
      delay(500);
      sim800.println("AT+CNMI=2,1,0,0,0");
      delay(500);
      while (sim800.available()) {  
        sim800.read();  //Consume previous serial data and clear buffer
      }
      sim800.print("AT+CMGR=");
      sim800.println(index);
      delay(1500);
      

    
      while(true){
        if(sim800.available()){
          while (sim800.available()) {
            sms += char(sim800.read());
          }
          break;
        }
      }

  String body = "";
  String phn_num = "";
  int startIndex = sms.indexOf("+94");
  phn_num = sms.substring(startIndex);
  int endIndex = phn_num.indexOf("\"");
  phn_num = phn_num.substring(0,endIndex);
  startIndex = sms.indexOf("{");
  endIndex = sms.indexOf("}$");
  Serial.println(startIndex);
  Serial.println(endIndex); 
  body = sms.substring(startIndex,endIndex+1);


      Serial.println("----- SMS START -----");
   
      Serial.print(phn_num);
      Serial.print(body);
      sim800.print("AT+CMGD=");
      sim800.println(index);
      sms="";
      delay(500);
      if(phn_num == "+94756982620"){
        res=sendDataToServer(body);
        Serial.println(body);
        Serial.print("HTTP Response : ");
        Serial.println(res);
        
      }

  sim800.println("AT+CMGD=1,4");
  delay(500);
  

}
void setup() {
  WiFi.begin(ssid, password);
  for(int i=0;i<20;i++){
    Serial.print(".");
    delay(1000);
  }
  sim800.begin(9600, SWSERIAL_8N1,12,14,false, 512); 
  Serial.begin(9600);
  Serial.print("Loading");
  sim800.println("ATE0");
  sim800.println("AT+CMGF=1");
  delay(500);
  sim800.println("AT+CPMS=\"SM\",\"SM\",\"SM\"");
  delay(500);
  sim800.println("AT+CNMI=2,1,0,0,0");
  delay(500);
  sim800.println("ATE0");
  sim800.println("AT+IPR=9600");
  
  sim800.println("AT+CREG?");
  sim800.println("AT+CMGD=1,4");
  delay(500);
  while (sim800.available()) {
    String rep = sim800.readStringUntil('\n');
    rep.trim();

    if (rep.indexOf(",1") != -1 || rep.indexOf(",5") != -1) { //searches a String object for the first occurrence of the substring ",1", returning its starting index (0-indexed) or -1 if not found.
      Serial.println("SIM800 is ready");
    }
  }  
  Serial.print("Deleting Meassages");
  sim800.println("AT+CMGD=1,4");
  delay(500);
  while(true){
    if(sim800.available()){
      Serial.println("sim800 response is :"+sim800.read());
      break;
    }
    Serial.print(".");
  }
  ;
  
  
}

void loop() {
   if (sim800.available()) {
    data = sim800.readStringUntil('\n');
    data.trim();//trim() removes extra spaces and invisible characters from the beginning and end of a string.

    // New SMS notification
    if (data.startsWith("+CMTI")) {
      int comma = data.lastIndexOf(',');
      int index = data.substring(comma + 1).toInt();
      readSMS(index);
    }
  }

}
