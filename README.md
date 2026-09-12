# Mohamed Mohamed Hussein — Portfolio

Live website: https://mohamed-hussein-portfolio.rainy-moon-2200.chatgpt.site

## View on your computer
Open dist/index.html in a browser. The website works without installation.

## Make changes
Use a text editor, such as Visual Studio Code or Notepad.
- dist/index.html: all visible text, About Me, experience, project entries and certificates.
- dist/styles.css: colours, spacing, type and mobile layout.
- dist/app.js: certificate and project image viewer.
- dist/assets/: portrait, certificate images and project previews.

Search index.html for the title or sentence you want to change.
To add a project, copy a complete <details class="project">...</details> block in the appropriate category, then edit its text.
To remove a project, remove that complete block.
To add a certificate, copy a complete button with class="certificate", update the title and image paths, and place the image in assets.
To replace your photo, replace assets/mohamed-hussein.jpeg with your new photo, retaining the same filename.
Keep an extra backup before editing. Open index.html to check your changes.

The JSON files are reference inventories; changing them alone does not change the website. Edit dist/index.html to update the displayed content.

## Publish updates
Local edits do not automatically change the live website. Ask your website assistant to publish the updated dist folder to the existing Site. Its identity is in .openai/hosting.json.
For other static hosting services, publish the contents of dist. No build step is required.

Only the website and its selected previews are included. The original university documents remain in their original folders.
