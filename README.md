# Mangrove-Forest-Monitoring-System

## Project Overview
This project serves as a live monitoring system for mangrove forest environmental data in remote areas.

## System Architecture
### Hardware
- **Sensors**: Air Temparature, Water Temparature, Humidity in the Air
- **Communication Devices**: SIM800 GSM Module, ESP32 WIFI

### Software Stack
- **Frontend**: Developed using **React** for a dynamic user experience.
- **Backend**: Built on **ASP.NET** with **SQL Server** to manage and query data efficiently.
- **Embedded Software**: Developed using C++ (Arduino IDE and ESP-IDF) 

## Installation Instructions
1. **Frontend Setup**:
   - Clone the frontend repository.
   - Install dependencies using `npm install`.
   - Start the server with `npm start`.

2. **Backend Setup**:
   - Clone the backend repository.
   - Install necessary packages.
   - Configure the database connection.
   - Run the API using `dotnet run`.

## Database Setup Steps
- Create a SQL Server database for the application.
- Execute the provided SQL scripts to set up tables and initial data.

## Network Configuration
- Backend and Frontend servers should be accessible to each other via HTTP
- SMS to HTTP Converter device must be in the same LAN as the backend server
- Configure firewall and CORS(important) rules to allow API communication between services

## SMS to HTTP Converter Device Requirements
- An SMS to HTTP converter device to facilitate communication between SMS and the backend system.
- Ensure it is configured to forward SMS data via HTTP to the designated API.
- Sensor Data Backend API = http://localhost:5000/Data/sendunitdata.
- Data must send to the back end as a json object.

## How to Use the System
1.  **Access the Web Interface**

Open your browser and navigate to http://localhost:3000 (or your frontend server URL)
Log in with your credentials

2. **View Real-Time Data**

Dashboard displays monitoring units from all sensor locations
Monitor water temperature, humidity, air temparature, and other parameters

3. **Historical Analysis**

Access historical data views to analyze trends over time
Export data for further analysis

4.  **Alerts & Notifications**

System generates alerts for abnormal readings
Notifications are displayed in the dashboard

## Conclusion
This system aims to enhance the understanding and monitoring of mangrove forests in ecosystems that are hard to access, leveraging modern technology.

## Contact Info
Name:Aruna Lakmal
Registration Number: 2021/CSC/033
Email: lakmalarunascc@gmail.com
Contribution: Project Lead — Hardware design and embedded software, Backend Development

Name: Pasan Nevinda
Registration Number: 2021/CSC/062
Email: wapasannewinda@gmail.com
Contribution: Backend development

Name: Damayanthi Wijesinghe
Registration Number: 2021/CSC/029
Email: diyamanthiwijeshinghe@gmail.com
Contribution: Frontend development

Name: Pabasara Samarakoon
Registration Number: 2021/CSC/050
Email: pabasara96samarakoon@gmail.com
Contribution: Frontend development 

## License
This project is licensed under the MIT License.
