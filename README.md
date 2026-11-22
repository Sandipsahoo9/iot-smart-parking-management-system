# 🚗 IoT-Based Smart Parking Management System

<p align="center">
  An intelligent IoT solution for real-time parking monitoring, online slot booking, QR-based ticket verification, and automated gate control.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/IoT-Smart%20Parking-blue" />
  <img src="https://img.shields.io/badge/ESP32-Microcontroller-red" />
  <img src="https://img.shields.io/badge/React-19-61DAFB" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF" />
  <img src="https://img.shields.io/badge/Firebase-Realtime%20Database-orange" />
</p>

## 📌 Overview

The **IoT-Based Smart Parking Management System** is an intelligent parking solution developed using Internet of Things (IoT), embedded systems, cloud computing, and web technologies.

The system integrates an ESP32 microcontroller with 12 IR sensors to detect vehicle occupancy in parking slots and update the information in Firebase Realtime Database.

A web-based application developed using React and Vite provides an interface for users and administrators to interact with the parking management system. It supports parking slot monitoring, booking workflows, QR code generation, ticket verification, and administrative management.

The system also incorporates an automated parking gate mechanism using an L298N motor driver and a BO DC motor. Gate operations are controlled through commands received from Firebase.

The primary goal is to improve parking efficiency, reduce manual intervention, minimize vehicle search time, and support smarter parking infrastructure.

## ✨ Key Features

- **Real-Time Parking Monitoring:** Monitor parking slot occupancy through 12 IR sensors.
- **Cloud Database Integration:** Synchronize parking information using Firebase Realtime Database.
- **User Dashboard:** Access parking information and booking functionality.
- **Parking Slot Booking:** Support digital parking reservation workflows.
- **QR Code Generation:** Generate QR codes for parking tickets.
- **QR Ticket Verification:** Scan and verify parking tickets using the camera.
- **Admin Dashboard:** Manage parking operations and ticket verification.
- **Automated Gate Control:** Control the parking barrier using ESP32 and an L298N motor driver.
- **Wireless Communication:** Exchange information between hardware and cloud services through Wi-Fi.

## 🛠️ Technology Stack

### Hardware

| Component | Purpose |
|---|---|
| ESP32 | Main microcontroller |
| 12 IR Sensors | Vehicle detection and slot occupancy monitoring |
| L298N Motor Driver | Motor direction control |
| BO DC Motor | Automated parking gate |
| Li-Po Battery | Power supply |
| Breadboard & Jumper Wires | Circuit connections |

### Software & Technologies

| Technology | Purpose |
|---|---|
| Arduino IDE | ESP32 programming |
| C/C++ | Embedded programming |
| React 19 | Frontend development |
| Vite 7 | Development server and build tool |
| JavaScript | Application functionality |
| Tailwind CSS 4 | Frontend styling |
| Firebase Realtime Database | Cloud database |
| Firebase SDK | Frontend database integration |
| React Router 7 | Application navigation |
| html5-qrcode | QR code scanning |
| qrcode.react | QR code generation |
| ArduinoJson | JSON data handling |
| HTTPClient | ESP32 HTTP communication |
| WiFiClientSecure | Secure HTTPS connection |

## 🏗️ System Architecture

```text
             HARDWARE LAYER
        ┌──────────────────────┐
        │     12 IR Sensors    │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │        ESP32         │
        │  Sensor Processing   │
        │   Wi-Fi Connection   │
        └──────────┬───────────┘
                   │
                   │ HTTPS / REST API
                   ▼
        ┌──────────────────────┐
        │ Firebase Realtime DB │
        │                      │
        │  Parking Slot Data   │
        │  Gate Commands       │
        │  Gate Status         │
        └──────────┬───────────┘
                   │
                   ▼
             WEB APPLICATION
        ┌──────────────────────┐
        │     React + Vite     │
        │                      │
        │    User Dashboard    │
        │    Admin Dashboard   │
        │    Slot Booking      │
        │    QR Verification   │
        └──────────────────────┘

             GATE CONTROL
        Firebase Gate Command
                   │
                   ▼
                 ESP32
                   │
                   ▼
             L298N Driver
                   │
                   ▼
                BO Motor
                   │
                   ▼
            Parking Gate
```

## ⚙️ Working Principle

### 1. Vehicle Detection
- Twelve IR sensors are installed to monitor parking slots.
- Each sensor detects whether a vehicle is present.
- ESP32 reads the digital output of each sensor.
- LOW indicates vehicle presence (occupied), while HIGH indicates an empty slot in the current firmware.

### 2. Firebase Communication
- ESP32 connects to Wi-Fi.
- Sensor information is uploaded to Firebase Realtime Database.
- Sensor values are updated periodically.
- The frontend uses Firebase to access parking information.

### 3. User Parking Workflow
- Users access the web application.
- They can view available parking information.
- Users can follow the booking workflow.
- QR codes are generated for parking tickets.

### 4. QR Ticket Verification
- The QR scanning functionality uses the device camera.
- The admin can scan and verify parking tickets through the web application.
- Ticket verification is integrated into the parking access workflow.

### 5. Automated Gate Operation
- The frontend communicates gate commands through Firebase.
- ESP32 periodically checks the gate command.
- When an OPEN command is detected, the motor rotates in one direction.
- When a CLOSE command is detected, the motor rotates in the opposite direction.
- The motor runs for the configured duration and then stops.
- Gate status is updated in Firebase.

## 🔌 ESP32 Configuration

The current Arduino firmware uses the following hardware configuration:

### IR Sensor GPIO Mapping

| Sensor | ESP32 GPIO |
|---|---:|
| IR1 | 13 |
| IR2 | 12 |
| IR3 | 14 |
| IR4 | 27 |
| IR5 | 26 |
| IR6 | 25 |
| IR7 | 33 |
| IR8 | 32 |
| IR9 | 35 |
| IR10 | 34 |
| IR11 | 39 |
| IR12 | 36 |

### Motor Driver GPIO Mapping

| L298N Connection | ESP32 GPIO |
|---|---:|
| IN1 | 16 |
| IN2 | 17 |
| EN | 4 |

### Firmware Timing Configuration

| Operation | Interval |
|---|---:|
| IR Sensor Data Upload | 1000 ms |
| Firebase Command Polling | 1000 ms |
| Wi-Fi Connection Check | 2000 ms |
| Motor Operation | 1000 ms |

*These values reflect the uploaded Arduino firmware.*

## 📂 Project Structure

```text
IoT-Smart-Parking-Management-System/
│
├── Arduino-Code/
│   └── major_aurdino_code.ino
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── ...
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── .gitignore
│
├── Documentation/
│   ├── Project_Report.pdf
│   └── Project_Presentation.pptx
│
└── README.md
```


## 💻 Installation and Setup

### Prerequisites

Install the following tools:

- [Arduino IDE](https://www.arduino.cc/en/software)
- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- A Firebase account

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/iot-smart-parking-management-system.git
```

### 2. Frontend Setup

Navigate to the frontend directory:

```bash
cd Frontend
```

Install the project dependencies:

```bash
npm install
```

Configure your Firebase project using the configuration expected by the frontend source code.

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:5173
```

### 3. Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

### 4. ESP32 Setup

1. Open Arduino IDE.
2. Install the ESP32 board package.
3. Install the required ArduinoJson library.
4. Open `major_aurdino_code.ino`.
5. Configure Wi-Fi and Firebase credentials securely.
6. Select the appropriate ESP32 development board.
7. Select the correct COM port.
8. Upload the firmware to ESP32.

## 🔥 Firebase Database Structure

The uploaded Arduino firmware communicates with the following Firebase paths:

```text
Firebase Realtime Database
│
├── IR_Sensors/
│   ├── IR1
│   ├── IR2
│   ├── IR3
│   ├── ...
│   └── IR12
│
└── gate/
    ├── command
    ├── status
    └── timestamp
```

### Gate Commands

| Firebase Command | Hardware Action |
|---|---|
| OPEN | Opens the parking gate |
| CLOSE | Closes the parking gate |

The ESP32 also updates the gate status and timestamp in Firebase.

## 🌍 Applications

- Shopping malls and commercial complexes
- Airports and railway stations
- Hospitals and healthcare facilities
- Corporate offices and IT parks
- Residential apartments
- Smart city infrastructure

## 🚀 Future Scope

- AI-based parking availability prediction.
- Online payment and automated billing.
- Vehicle number plate recognition.
- Mobile application integration.
- EV charging station management.
- GPS-based parking navigation.
- Advanced analytics for parking utilization.
- Integration with smart city infrastructure.

## 🎯 Project Objectives

- Develop an IoT-based parking management solution.
- Automate vehicle detection and parking slot monitoring.
- Integrate embedded hardware with cloud computing.
- Develop a user-friendly web-based parking interface.
- Implement QR-based ticket verification.
- Automate parking gate operations using motor control.

## 📚 Project Documentation

The repository includes academic project documentation:

- **Project Report:** Detailed explanation of the system, hardware, software, architecture, and working principle.
- **Project Presentation:** Project overview, hardware components, working model, system architecture, applications, and future scope.

## 🔐 Security Notice

- Never upload Wi-Fi passwords or private Firebase credentials.
- Keep sensitive configuration in local, untracked files.
- Use appropriate Firebase Realtime Database security rules.
- Do not expose privileged database authentication tokens in public source code.

## ⭐ Acknowledgement

This project was developed as an academic engineering project, combining Embedded Systems, IoT, Cloud Computing, and Web Development to address real-world parking management challenges.

---

**If you find this project interesting, don't forget to ⭐ the repository!**
