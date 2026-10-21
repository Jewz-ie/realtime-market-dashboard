# Real-Time Market Data Dashboard

A high-performance, real-time cryptocurrency dashboard that ingests live price feeds via WebSockets and renders dynamic data visualizations without page refreshes.

![Dashboard Preview](assets/dashboard-ui.png)

## Overview
This project demonstrates low-latency data streaming and real-time frontend visualization. Built with an event-driven architecture, it handles streaming price ticks, updates DOM metrics, calculates session changes, and renders a 60 FPS line chart using Chart.js.

To ensure continuous operation regardless of regional ISP blocks or network firewalls, the application features an event-driven Mock WebSocket architecture (`MockBinanceWebSocket`) that perfectly replicates the payload structure and timing of the Binance Public Stream API.

## Key Features
* **Real-Time Data Streaming:** Handles high-frequency price ticks with sub-50ms rendering latency.
* **Resilient Architecture:** Includes a custom Mock WebSocket fallback class to simulate live Binance trade streams locally.
* **Memory-Optimized Charting:** Implements array shifting (`push`/`shift`) on a fixed sliding window (50 data points) to prevent browser memory leaks.
* **Dynamic Metrics:** Live-calculates current price, percent session changes, and directional color indicators (green/red).

## Tech Stack
* **Frontend:** HTML5, Tailwind CSS
* **Visualization:** Chart.js
* **Networking / Data:** JavaScript (ES6+), WebSockets API

## Snapshots

### 1. Live Data Stream Debugging
![Console Stream](assets/console-stream.png)

### 2. Architecture & Logic Implementation
![VS Code Logic](assets/vscode-logic.png)

## How to Run Locally
1. Clone this repository: