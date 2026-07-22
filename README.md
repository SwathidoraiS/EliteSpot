# EliteSpot - Car Parking Management System

## Overview

EliteSpot is a smart parking management system developed to automate vehicle parking, reservation, and monitoring inside an organization. The system enables employees to reserve parking slots, while administrators can manage users, parking layouts, bookings, and parking activities through a centralized dashboard.

The application integrates with an **ANPR (Automatic Number Plate Recognition) camera system** to automatically detect vehicle entry and exit, updating parking status in real time.

---

# Features

## User Features

* Employee Login & Authentication
* Reserve Parking Slots
* View Parking Layout
* Book Today's or Tomorrow's Parking
* Cancel Reservations
* Booking History
* Email Notifications
* Password Reset
* Feedback Submission
* English / Japanese Language Support
* Responsive UI for Desktop & Mobile

---

## Admin Features

* User Management (Add, Edit, Delete)
* Parking Slot Management
* Booking Management
* Feedback Management
* Role-Based Access Control

---

# Camera Integration

The system is integrated with an **ANPR Camera** through a secure webhook service.

### Vehicle Entry Flow

1. Camera detects vehicle number plate.
2. Camera sends vehicle data to the webhook.
3. Webhook validates the request.
4. Vehicle details are verified against the booking database.
5. Booking status is automatically updated to **Parked**.
6. Parking slot color changes in real time.

### Vehicle Exit Flow

1. Camera detects vehicle exit.
2. Webhook receives exit event.
3. Booking is updated to **Exit**.
4. Parking slot becomes available for future reservations.

---

# Email Notifications

The system automatically sends emails for:

* Password Reset
* Reservation Reminder (5 minutes before booking)
* Auto Cancellation Notification (if vehicle is not parked within the allowed grace period)

---

# Tech Stack

### Frontend

* React
* TypeScript
* HTML5
* CSS3

### Backend

* Node.js
* Express.js
* REST API

### Database

* Microsoft SQL Server

### Authentication

* JWT Authentication
* Role-Based Authorization

---


Architecture follows:

* 3-Tier Architecture
* Client-Server Architecture
* MVC Pattern
* Event-Driven Architecture for real-time parking updates

---

# System Workflow

```
User Login
      │
Reserve Parking Slot
      │
Booking Created
      │
Reminder Email Sent
      │
Vehicle Arrives
      │
ANPR Camera Detects Plate
      │
Webhook Receives Data
      │
Booking Updated to Parked
      │
Vehicle Exit Detected
      │
Booking Completed
      │
Slot Available Again
```
---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/car-parking-system.git
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
npm install
npm run dev
```


