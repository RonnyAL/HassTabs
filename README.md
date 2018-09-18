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

![Screencap](https://i.imgur.com/jt99O4z.gif)

## Known issues

This extension is still in early development, and only uploaded to allow others to build on my very basic work. For now, there are two main issues that I'm aware of.

### 1. Security and local storage

Both the Home Assistant URL and the http password are currently stored using Chrome's [localStorage API](https://developer.chrome.com/apps/storage). As far as I know, it is not recommended to store sensitive information this way, and the only reason I chose to do it this way is because I don't a better way yet. Hopefully someone else does!

### 2. Authentication

For now, the only way to authenticate is using the http password. In future releases of Home Assistant this method will be deprecated, making room for the [new authentication system](https://www.home-assistant.io/docs/authentication). At that point this extension should utilize that functionality - which will hopefully improve things from a security perspective as well.

## Todo

As I'm a student and still learning Javascript, I can't say for sure that I'll find the time to implement the ideas I have. Therefore, I'll list them here as inspiration for those who might feel compelled to join the project.

### Entities

It should be possible to select entity states and attributes to be displayed. Additionally, work must be done to allow the user to determine how and where to display this text (fonts, colors, position). While we're at it, it should be possible to customize strings as well - maybe by utilizing [POST /api/template](https://developers.home-assistant.io/docs/en/external_api_rest.html#post-api-template)?

### Services

It should be possible to trigger services by clicking buttons, text, images, icons or whatever. Especially here lies great potential for customizability and hence a huge coding challenge.

### Cache? localStorage?

Configured entities and services must be stored somehow. This could be done using either config files or the [localStorage API](https://developer.chrome.com/apps/storage). The advantage of the latter is that it allows synchronization between devices. My thoughts so far (with my limited understanding of the issue) is that user configuration data (entities to track, callable services and corresponding service data, element coordinates) should be saved in localStorage - while last known states and attributes could be cached using JSON files. That way one could display entity states immediately when the page loads instead of having to wait for a response from Home Assistant.

### Design

The overall design and workflow of the extension requires some focus. I've created a new branch where I experiment with it - mostly using snippets of code I'm finding online. The issue with that is that I'm cluttering up my (admittedly, already messy) code, which is why I decided to work on it in a new branch.
