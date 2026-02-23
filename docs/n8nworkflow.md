# 8n Workflow: Google Form to GitHub Issues (Normie-friendly)

## Overview
- This document describes how to connect Google Forms submissions to GitHub by using n8n to auto-create issues that are easy for non-technical users to understand and discover.
- The flow is designed so a regular user can submit a form and have a clean, readable GitHub issue created in a chosen repository.

## Architecture (high level)
- Google Form -> Google Apps Script/Sheets trigger collects responses.
- Trigger posts a payload to an n8n Webhook (Webhook node).
- n8n processes and normalizes the data, then calls the GitHub node to Create Issue.
- Optional: post-creation notification (e.g., Slack, email) for visibility and triage.

## Prerequisites
- n8n instance (self-hosted or cloud) with access to:
  - GitHub repository (with a token that can create issues in that repo)
  - Google Form working submissions (responses stored in Google Sheets or directly via Apps Script)
- A server-available Webhook URL from n8n (e.g., https://your-n8n.example/webhook/google-form)
- A small Apps Script (or Sheets-based trigger) to POST the form data to the n8n webhook

## How to wire it up
- Step 1: Create a Google Form and ensure responses are available (preferably in a Google Sheet).
- Step 2: Create an Apps Script or Sheets trigger to POST the form data to the n8n webhook URL.
- Step 3: In n8n, build a workflow with:
  - Webhook trigger: method POST; path /webhook/google-form; option to require a simple shared secret for security.
  - Optional: IF/Switch to validate required fields.
  - Set or Function node to normalize payload into GitHub issue fields:
      title: the short form summary, possibly prefixed with [User Feedback]
      body: a readable, normie-friendly body including form fields, reproduction steps, environment, and any links/images
      labels: e.g., ["user-feedback"], or ["bug"], ["triage-needed"] depending on form data
      assignees: optional, or omit to skip
  - GitHub node: action Create Issue; map repo, title, body, labels, and optionally assignees.
- Step 4: Optional notification nodes (Slack, Email) to surface new issues to your team.
- Step 5: Return a success message on the webhook endpoint.

## Data mapping guidance
- Map Google Form fields to a readable GitHub issue:
- Example form fields: Title, Description, Steps to Reproduce, Expected Result, Actual Result, Environment, Category (Bug/Idea/Question), Priority.
- Issue body template (normie-friendly):
  - Summary:
  - Description:
    - <Description>
    - Steps to Reproduce:
      1. ...
    - Expected Result: ...
    - Actual Result: ...
  - Environment: <Environment>
  - Form Submission Link: <URL>
- Tags/labels based on Category and Priority to aid discoverability.

## Security notes
- Use a shared secret on the n8n Webhook and Apps Script to ensure only submissions from your source can trigger the flow.
- Keep GitHub token scope limited to issues: write only for the needed repo, and rotate tokens periodically.

## Testing and validation
- Submit a test form, verify a GitHub issue is created with the expected title/body/labels.
- Check n8n execution logs for payload normalization or mapping errors.
- Confirm that any notifications reach the intended channels.

## How this fits into the Fenrir workflow
- This pattern captures end-user feedback (normies) directly into GitHub for visibility and triage.
- It reduces back-and-forth by providing a consistent template for issues created from user submissions.
- It can be extended to triage automatically or escalate high-priority items to developers.

## Developer notes
- Export the n8n workflow (JSON) and store it under a versioned path for auditing (e.g., workflows/google-form-to-gh-issues.json).
- Keep the mapping logic in a small Set/Function node rather than hard-coding in multiple places to ease maintenance.
- Add automated tests or lightweight smoke tests where feasible.

## Payload example
```json
{
  "formId": "BUG_REPORT",
  "fields": {
    "title": "Login fails on Safari iOS",
    "description": "Users report that login fails on Safari iOS 14+.",
    "steps": [
      "Open app",
      "Tap login",
      "Enter credentials",
      "Tap submit"
    ],
    "environment": "iOS 14.4, Safari 14.0",
    "category": "Bug",
    "priority": "High",
    "formLink": "https://docs.google.com/forms/d/…/viewform"
  }
}
```

## Next steps
- If you want, I can generate a minimal n8n workflow JSON exposing the described nodes and mappings, or guide you through wiring up the Apps Script side.

## Notes on current implementation in repository
- Fenrir issues.json: baseline flow using Google Sheets trigger and GitHub create-issue node, with labels derived from the form type and a basic description body.
- Fenrir issues ai.json: AI-augmented flow that adds an AI-generated developer-facing description to the issue body via an SSH-based AI command.
- The AI augmentation is optional and intended to aid developers by surfacing suggested code areas and terms to triage quickly.

## What the AI step does (recap)
- Location: In Fenrir issues ai.json, an SSH node executes a remote AI command that reads the codebase and returns a developer-facing description.
- Output: The AI-generated text is injected into the GitHub issue body, alongside the user-provided content.
- Purpose: To provide engineers with actionable context and probable code touchpoints to speed up debugging and fixes.
- Safeguards: Review and validation are recommended before publishing AI-generated content to GitHub to avoid leaking sensitive info or misguiding triage.
