# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Setup and Deployment

```bash
# Install dependencies
npm install

# Create a scratch org
sfdx force:org:create -f config/project-scratch-def.json -a myorg

# Deploy code to scratch org
sfdx force:source:push -u myorg

# Retrieve changes from org
sfdx force:source:pull -u myorg

# Open org in browser
sfdx force:org:open -u myorg
```

### Code Quality and Testing

```bash
# Run linting
npm run lint

# Format code
npm run prettier

# Check formatting without changes
npm run prettier:verify

# Run LWC unit tests
npm test

# Run tests with coverage
npm run test:unit:coverage

# Run tests in watch mode
npm run test:unit:watch

# Run Apex tests
sfdx force:apex:test:run -u myorg
```

### Development Workflow

```bash
# Run a single LWC test file
npm test -- force-app/main/default/lwc/componentName/__tests__/componentName.test.js

# Execute anonymous Apex
sfdx force:apex:execute -f scripts/apex/hello.apex -u myorg

# Run SOQL query
sfdx force:data:soql:query -q "SELECT Id, Name FROM Account" -u myorg
```

## Code Architecture

### Project Structure

This is a Salesforce DX project focused on a boat rental/sales application. The main components are:

1. **Lightning Web Components** (`force-app/main/default/lwc/`)

   - `boatPicker`: Main component for boat selection and display
     - Uses lightning-record-picker for search functionality
     - Displays boat details (image, name, owner, price, type)
     - Exposed to Lightning Home Page

2. **Custom Objects**

   - `Boat__c`: Core object with fields for boat details, pricing, and ownership
   - `BoatType__c`: Categorization for boats
   - `BoatReview__c`: Review functionality for boats

3. **Static Resources**
   - `PleasureBoats`: Collection of boat images used in the application

### Key Development Patterns

- LWC components should follow the existing pattern in `boatPicker`
- Use `@wire` decorators for data access with Lightning Data Service
- Component tests go in `__tests__` subdirectories
- API version is 62.0 - ensure compatibility when adding new features

### Testing Strategy

- Unit tests use Jest for LWC components
- Test files should be named `componentName.test.js`
- Apex tests should provide at least 75% code coverage
- Use `@isTest` annotation for Apex test classes
