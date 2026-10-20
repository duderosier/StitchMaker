# One self-contained HTML file, all processing on the phone, served from a static host

The whole app is a single `index.html` (markup, styles, script and the DMC Floss table inline, no build step). Every image operation, Pattern edit and Chart PDF runs in the browser, so photos never leave the phone and there is no server to run or pay for. Because iOS (the main target) won't run scripts in an HTML file opened from the Files app, the file is served from a static host (GitHub Pages) and installed with "Add to Home Screen"; the same URL is used for Android testing.

## Considered Options

- **Opening the file locally**: rejected; iOS shows a script-less preview and Android behaviour varies by file manager.
- **Private claude.ai artifact link**: fine for previews, but it needs a claude.ai sign-in and runs inside a sandboxed frame, which makes file downloads, the share sheet and a clean home-screen app less reliable on iOS.
- **A framework with a build step / a backend**: unnecessary for a personal tool and would break the "one file" constraint.
