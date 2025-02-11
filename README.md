# LMS Dash Chrome Extension

**Note:** LMS Dash is currently in beta. Unexpected errors may occasionally happen.

[LMS Dash is available on the Chrome Web Store](https://chromewebstore.google.com/detail/lms-dash/dphccimingcbmlkehpflgkningeomenp)

LMS Dash is your Canvas assistant that is always ready in your browser. This browser extension helps instructors,
instructional designers, and administrators spend less time on managing Canvas and more time on delivering great
courses. LMS Dash simplifies course and LMS management tasks by offering features that are not natively available in
Canvas. Here are some of the things LMS Dash can do:
- Scan Courses
- (More features coming soon)

## Course Scanner
One of the most important features of LMS Dash is the course scanner. Do your courses have old addresses, old links,
wrong contact information, or retired faculty names that need to be removed or updated? LMS Dash can help you find these
in your own courses and (if you are a Canvas admin) help you find these in every course in a term. You scan course
pages, assignments, announcements, and more for specific text. You can also scan the HTML of course items to find links, 
in-line CSS styling, and more! LMS Dash will show you in which course it found the text and give you a link directly to 
the item where it was found. 

## Developers

If you need a specific feature that is not already built into LMS Dash, consider becoming a contributor. However, the
feature must be broadly useful and not introduce potential security vulnerabilities. 

You may also extend or modify LMS Dash for you own personal needs by using the source files to build a local version and
 running it in Chrome's developer mode. This will also let you build a version with a modified manifest, so you can run it on 
non-"instructure.com" domains. Be careful to not use a wildcard match because doing so is a security vulnerability and
could slow down your browser. Be sure to follow the AGPL-3.0 License regarding any modifications.

### Overview

LMS Dash follows the Manifest v3 spec for browser extensions and is made to work with Google Chrome. The browser
extension consists of three main parts:
- **Side Panel** - A React app that runs in Chrome's side panel.
- **Background Script** - The main controller of the application that coordinates large tasks and message passing.
- **Content Script** - Interacts with Canvas by fetching and posting data via the Canvas API.

Some code is shared among all three parts, and these are in the **shared** directory.

**Dependencies:** [Animate.css](https://github.com/animate-css/animate.css),
[Radix UI Primitives](https://github.com/radix-ui/primitives), [React](https://github.com/facebook/react), 
[React Select](https://github.com/jedwatson/react-select), [Rollup.js](https://github.com/rollup/rollup), 
[TanStack Query](https://github.com/TanStack/query), [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss),
[Vite](https://github.com/vitejs/vite)

### Local Set Up
1. Clone the repository.
```shell
git clone https://github.com/seanbeirnes/lmsdash-browser-extension.git
```
2. Navigate to the root directory.
```shell
cd lmsdash-browser-extension/
```
3. Install the npm packages.
```shell
npm install
```
4. Build!

**Option 1:** Build the dev version (Runs slower due to extra logging)
```shell
npm run dev
```

**Option 2:** Build the production version
```shell
npm run build
```
The build will be in the "dist" directory. This is where you will need to tell Chrome to look for the extension.
