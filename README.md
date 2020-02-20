# Contextual Reference
UI Extension for showing help for the current content type that's being edited.

## Installation

* Set up your extension in your space:

```bash
npm install
contentful login
npm run configure
npm run start
```

* Run the migration to set up ypur Contextual Help content type:

```bash
contentful space migration migrations/createInternalContextualHelp.js
```

* Add the extension to the sidebar of each content type you want contextual help for.
* Create an Internal Contextual Help for each of the Content Types you're interested in adding additional help for.
* The sidebar widget will now display the Content Type description, and will load the additional help on a dialog when you press the button.
