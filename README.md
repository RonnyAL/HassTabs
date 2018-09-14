# HassTabs

A "New tab" Chrome extension that communicates with your instance of Home Assistant!

## Getting started

Save the extension files in a folder and navigate to "chrome://extensions" (URL) in Chrome. There you should find a button saying "Load unpacked extension". Click this button, navigate to the folder you created and click OK. After that's done, click the "Details" link next to the now activated extension, and click "Options". From the page that appears, enter your Home Assistant URL and http password and click save. The only confirmation will be logged in the Javascript console, which you can see by pressing Ctrl+Shift+J.

Before proceeding, copy your extension ID (you can find it in chrome://extensions). Now, in your configuration.yaml file, you need the following (replace "<EXTENSION_ID>" with the actual ID):

```
http:
  cors_allowed_origins:
    - chrome-extension://<EXTENSION ID>
```

When all of this is done, open a new tab and you should be able to see a list of entities and services from your instance of Home Assistant!

## Known issues

This extension is still in early development, and only uploaded to allow others to build on my very basic work. For now, there are two main issues that I'm aware of.

### 1. Security and local storage

Both the Home Assistant URL and the http password are currently stored using Chrome's [localStorage API](https://developer.chrome.com/apps/storage). As far as I know, it is not recommended to store sensitive information this way, and the only reason I chose to do it this way is because I don't a better way yet. Hopefully someone else does!

### 2. Authentication

For now, the only way to authenticate is using the http password. In future releases of Home Assistant this method will be deprecated, making room for the [new authentication system](https://www.home-assistant.io/docs/authentication). At that point this extension should utilize that functionality - which will hopefully improve things from a security perspective as well. 
