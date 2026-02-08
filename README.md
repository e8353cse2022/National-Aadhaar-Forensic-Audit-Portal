

# Run and deploy App
1) High-Level Purpose

This project is a forensic audit portal that:

Imports structured Aadhaar-like dataset records

Detects anomalies using rule-based logic

Uses an AI service for deeper fraud/context analysis

Provides dashboards, location intelligence, and action tracking

Enforces login/session workflow

Think of it as a data ingestion → analysis → intelligence → decision interface pipeline.

2) Core Architecture

This is a React + TypeScript frontend app built with Vite. There is no traditional backend here — AI intelligence is fetched through an external API service layer.

Architecture layers:

UI Layer (React Components)
        ↓
State + Controller Layer (App.tsx)
        ↓
Processing Layer (dataProcessor.ts)
        ↓
AI Service Layer (geminiService.ts)
        ↓
External AI API


Each layer has a clearly defined responsibility.

3) Entry Point & Application Controller
App.tsx — Central Orchestrator

This file is the state brain of the application.

It manages:

Dataset state

Anomaly detection results

AI analysis responses

Login/authentication state

UI tab routing

Action tracking history

Key responsibilities:

A) Data lifecycle

When a dataset is loaded:

CSV upload → parseCSV() → structured records
           → detectAnomalies()
           → stats generation
           → optional AI analysis

B) System status management

The app transitions through states like:

Unauthenticated

Ready for analysis

AI processing

Completed review

This prevents invalid operations (e.g., AI analysis without data).

4) Data Processing Engine
utils/dataProcessor.ts

This is your deterministic audit engine.

parseCSV()

Converts raw CSV input into typed structured records:

Raw CSV row → normalized AadhaarDataRow object


Includes:

Field validation

Missing value handling

Type enforcement

detectAnomalies()

Rule-based anomaly detection:

Examples of logic patterns:

Duplicate identifiers

Suspicious demographic mismatches

Invalid formatting

Behavioral inconsistencies

Output:

AnomalyResult[]


Each anomaly includes:

Severity classification

Reasoning

Associated record

This is pure logic-driven, not AI-driven.

5) AI Intelligence Layer
services/geminiService.ts

This layer abstracts all AI communication.

Functions include:

A) Fraud pattern analysis
analyzeFraudPatterns(data, anomalies)


Provides:

Risk clustering

Behavioral interpretation

Pattern recognition beyond rule logic

B) Regional intelligence
getRegionalIntel(query)


Fetches contextual information related to geography or trends.

C) Location verification
verifyLocationContext(person)


Adds AI-driven plausibility assessment.

Important:

AI responses are advisory, not deterministic. The app treats them as contextual intelligence, not ground truth.

6) UI Modules

Each component represents a functional workspace.

Dashboard.tsx

Primary audit interface:

Dataset overview

Anomaly visualization

AI results display

Record inspection

This is where analysts interpret findings.

LoginPage.tsx

Authentication gateway:

Controls access

Initializes user session state

LocationHub.tsx

Geospatial verification interface:

Location-based queries

AI-assisted validation

StateGovHub.tsx

Regional/state-level intelligence workspace:

Aggregated context lookup

Policy or regional interpretation layer

ActionCenter.tsx

Decision tracking module:

Record flagged actions

Audit trail/history

Investigator workflow simulation

7) Type System
types.ts

Defines strict schemas:

Dataset record models

Anomaly structures

AI result formats

User/session data

This ensures:

Predictable behavior

Compile-time safety

Data integrity across modules

8) Execution Flow (End-to-End)

Here’s what happens during a typical session:

Step 1 — Authentication

User logs in → session state initialized

Step 2 — Data ingestion

CSV uploaded → parsed → structured dataset stored

Step 3 — Deterministic anomaly scan

Rule engine evaluates records → anomaly list generated

Step 4 — AI augmentation

Optional intelligence:

Fraud pattern insights

Regional context

Location verification

Step 5 — Analyst review

Dashboard displays:

Statistical overview

Risk signals

AI commentary

Step 6 — Action recording

User flags decisions → stored in action history

9) Separation of Responsibilities

The system intentionally separates:

Layer	Role
UI	Visualization + interaction
Controller	State orchestration
Processor	Deterministic anomaly detection
AI service	Contextual intelligence
Types	Structural guarantees

This makes the system:

Maintainable

Testable

Extensible

10) Running the System

Environment setup:

npm install
Add Gemini API key → .env.local
npm run dev


Vite launches a local dev server.

Conceptual Model

You can think of the system as:

Data audit engine
+ AI advisory intelligence
+ Analyst decision interface
This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1jw1WwRqP0x7XY8BHBmXZFQsNY7SbAsaB

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
