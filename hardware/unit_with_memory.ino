#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <RtcDS3231.h>
#include <SoftwareWire.h>
#include <SPI.h>
#include <SD.h>

#define ONE_WIRE_BUS 2
#define SHT30_ADDR 0x44
SoftwareWire myWire(3, 4); // SDA, SCL

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
String phoneNumber = "+94752887845";   
char messageText[120] = "Hello from Arduino Nano";
float waterTempC = 0;
float airTemp = 0;
float airHum = 0;
RtcDS3231<SoftwareWire> rtc(myWire);
File myFile;
RtcDateTime now;
int lastMinute = -1;
int currentMinute = -1;
String data = "";
int chipSelect = 10;

//int waterTemp_max = 40;
//int airTemp_max = 35;
//int humidity_max = 80;
void alertAdmin(String msg){
  Serial.println("AT+CMGF=1");
  delay(1000);
  Serial.println("AT+CSCS=\"GSM\"");
  delay(1000);
  Serial.println("AT+CMGS=\"+94764746528\"");
  delay(1000);
  Serial.print(msg);
  delay(500);
  Serial.write(26);
}
void sendSms(){
  Serial.println("AT+CMGF=1");
  delay(1000);
  Serial.println("AT+CSCS=\"GSM\"");
  delay(1000);
  Serial.println("AT+CMGS=\"+94752887845\"");
  delay(1000);
  now = rtc.GetDateTime();
 //===================================================
  char t1[10], t2[10], t3[10];

  // Convert float → string
  dtostrf(waterTempC, 4, 2, t1);
  dtostrf(airTemp,    4, 2, t2);
  dtostrf(airHum,     4, 2, t3);

// Build final JSON
  snprintf(messageText, sizeof(messageText), "{\"id\":1,\"Vals\":{\"1\":%s,\"2\":%s,\"3\":%s}}$", t1, t2, t3);
  Serial.print(messageText);
  delay(500);
  Serial.write(26); 
  delay(5000);
//=========================================================
  //wait for acknowledge
  Serial.println("ATE0");
  Serial.println("AT+CMGF=1");
  delay(500);
  Serial.println("AT+CPMS=\"SM\",\"SM\",\"SM\"");
  delay(500);
  Serial.println("AT+CNMI=2,1,0,0,0");
  delay(500);
  digitalWrite(9,HIGH);

  
while(1) {
  now = rtc.GetDateTime();
  currentMinute = now.Minute();
    if(currentMinute != lastMinute){
        myFile = SD.open("data.txt", FILE_WRITE);
        digitalWrite(9,LOW);
        if (myFile) {
          myFile.println(messageText);
          myFile.close(); 
          alertAdmin("Server not responding !!!");
          Serial.println("File wrote");
        }
        break;
    }
   if (Serial.available()) {
    data = Serial.readStringUntil('\n');
    data.trim();//trim() removes extra spaces and invisible characters from the beginning and end of a string.

    // New SMS notification
    if (data.startsWith("+CMTI")) {
      digitalWrite(9,LOW);
      break;
    }
  }

}
  Serial.println("AT+CMGD=1,4");
  delay(500);
}
void getairTemp_airHum(){
  
  Wire.beginTransmission(SHT30_ADDR);
  Wire.write(0x2C);
  Wire.write(0x06);
  Wire.endTransmission();
  delay(500);
  Wire.requestFrom(SHT30_ADDR, 6);

  if(Wire.available()==6)
  {
    uint16_t temp_raw = Wire.read()<<8 | Wire.read();
    Wire.read(); // CRC

    uint16_t hum_raw = Wire.read()<<8 | Wire.read();
    Wire.read(); // CRC



    airTemp = -45 + (175 * (temp_raw / 65535.0));
    airHum = 100 * (hum_raw / 65535.0);

   
  }
}
void getWaterTemp(){
  sensors.requestTemperatures(); 
  waterTempC = sensors.getTempCByIndex(0);
}
void setup() {
  
  pinMode(9,OUTPUT);
  pinMode(10,OUTPUT);
  for(int i=0;i<6;i++){
    digitalWrite(9,HIGH);
    delay(1000);
    digitalWrite(9,LOW);
    delay(1000);
  }
  Serial.begin(9600);
  Serial.println("AT+CMGD=1,4");
  delay(500);
  myWire.begin();
  rtc.Begin();
  Wire.begin();
   
//=========================================
if (!SD.begin(chipSelect)) {
 // Serial.println("SD init failed!");
  alertAdmin("Backup memory issue !!!");
} else {
 // Serial.println("SD init success");
}
//=========================================
  sensors.begin();  
  rtc.SetDateTime(RtcDateTime(__DATE__, __TIME__));
  now = rtc.GetDateTime(); 
  currentMinute = now.Minute();
  lastMinute = now.Minute();
  getWaterTemp();
  getairTemp_airHum();
  sendSms();
}

void loop() {
  now = rtc.GetDateTime();
  currentMinute = now.Minute();
  if(currentMinute != lastMinute){
    lastMinute = currentMinute;
    getWaterTemp();
    getairTemp_airHum();
    sendSms();
  }
 
}
