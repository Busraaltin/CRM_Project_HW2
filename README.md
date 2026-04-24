# 🚀 Node.js CRM Pipeline & Dual Persistence Workflow

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

Welcome to the **Lead Capture & Dual Persistence Pipeline** project! This repository contains the backend architecture developed for **HW2**, designed to capture client leads securely, prevent data loss through local storage, and synchronize with a cloud CRM.

---

## 🌟 Project Highlights (HW2 Architecture)

In this iteration of the project, we evolved from a simple webhook to a highly robust **Dual Persistence System**:

1. **Strict Payload Validation 🛡️**: The endpoint actively rejects incomplete data, returning a `400 Bad Request` if `name`, `email`, or `message` is missing.
2. **Local Fallback (SQLite) 💾**: Before interacting with external APIs, incoming data is instantly logged into a local `database.sqlite` file. This guarantees zero data loss even if the internet drops.
3. **Antigravity Connector 🌌**: A custom Node.js module that securely maps our payload to match the CRM's strict column requirements (`contact_name`, `captured_at`, etc.).
4. **Cloud CRM Sync 📊**: Validated data is ultimately pushed to Google Sheets in real-time.

---

## 📂 File Structure

| File | Description |
|------|-------------|
| 📄 `hw2_server.js` | The core Node.js server featuring dual-persistence logic. |
| 📄 `HW2_Report.md` | Detailed architectural analysis and visual proof. |
| 📊 `hw2_workflow_uml.md` | The Mermaid.js flowchart source code representing the system logic. |
| 🌐 `hw2_diagram.html`| An interactive, browser-ready visual representation of the UML flowchart. |

---

## 🚀 How to Run the Server

To test the architecture on your local machine, follow these steps:

### 1. Install Dependencies
Ensure you have Node.js installed, then run:
```bash
npm install
```

### 2. Start the Server
```bash
node hw2_server.js
```
*You should see a success message indicating the server is running on port 3001 and the SQLite database is connected.*

---

## 🧪 Testing with Postman

You can trigger the webhook using Postman or any API tester. 

**Request Details:**
- **Method:** `POST`
- **URL:** `http://localhost:3001/submit`
- **Headers:** `Content-Type: application/json`

**JSON Body (raw):**
```json
{
  "name": "Büşra Altın",
  "email": "busra.altin@university.edu",
  "message": "Testing the Dual Persistence architecture!"
}
```

### Expected Output:
1. **Terminal:** `🟢 Veri Başarıyla Alındı` $\rightarrow$ `✅ SQLite Kaydı Başarılı!`
2. **Postman:** `200 OK` status with success JSON.
3. **Google Sheets:** A new row dynamically appears with the timestamp and Lead Status.

---
*Developed by Büşra Altın for the Workflow Assignment.*
