# Youtube Video Patch

When viewing any page on Youtube, the extension will notice unavailable videos, search for the original video title using the Wayback Machine or other search engines and then update the page content with a re-uploaded video with the same title.

**There is no tracking of any user data.**. The extension only targets URLs matching "https://www.youtube.com/*". See [here](extension/chrome/public/manifest.json).

This extension is free to use, please [donate](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=SCCDZQ7E3KUR6&currency_code=CAD&source=url)!

<image src="https://lh3.googleusercontent.com/trOSL7RkamfAwk9W4rBY8K6dD_EAdry86DRneLhyW5_0B0ELBw2vpEpQDDChaCXtx_GYxr97qw=w640-h400-e365" />

## Developing on extension:

1. In `/extension`, run `make build` to create a build
1. In chrome, navigate to `chrome://extensions/` and upload the `/extension/chrome/build` folder
