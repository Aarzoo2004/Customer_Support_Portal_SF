Salesforce Experience Cloud – Customer Support Portal

This project is a basic Customer Support Portal built using Salesforce Experience Cloud, Lightning Web Components (LWC), and Apex.
The portal is accessible from my Salesforce org and the LWCs render correctly when the site is opened using my authenticated Salesforce credentials.

✅ Features
🔹 Lightning Web Components (LWC)

Built custom LWCs in VS Code using Salesforce Extension Pack.

Components used:

Case Dashboard – displays summary of cases.

Customer Case List – shows list of cases for the logged-in user.

LWCs are deployed to the org and visible in the portal pages.

🔹 Experience Cloud Site

Created a Customer Service Experience Cloud site.

The site opens successfully using my own Salesforce login.

The custom LWCs appear on the portal pages when viewed via the authenticated session.

🔹 Apex Controller (Developer Console)

Wrote backend logic using Apex in Developer Console.

The Apex class handles:

Fetching cases for the logged-in user

Creating new cases

Updating “last viewed” timestamp

SOQL was used inside Apex to query data from Case and User objects.

✅ Technologies Used

Lightning Web Components (LWC)

Apex (Developer Console)

SOQL

Salesforce Experience Cloud

Salesforce Setup & Admin Configuration

VS Code + Salesforce Extension Pack

✅ Deployment Notes

LWCs were created and deployed using VS Code (Salesforce CLI tools).

Apex was written directly in the Salesforce Developer Console.

Experience Cloud pages were edited using Experience Builder.

The site can be viewed through the “Open Site / Link to Site” option in Salesforce (authenticated view).

✅ Screenshots are available in SF folder

✅ Summary

This project demonstrates:

Basic Experience Cloud setup

Usage of Lightning Web Components

Apex backend integration

SOQL queries

Viewing deployed components inside a Salesforce site
