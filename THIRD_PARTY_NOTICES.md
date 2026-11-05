# Third-party software

CodeMirror 5.65.20 provides the local text editor. Copyright (C) 2017 by Marijn Haverbeke and others. Distributed under the MIT license; the complete notice is in `Resources/CodeMirror-LICENSE.txt`.

Source: https://registry.npmjs.org/codemirror/-/codemirror-5.65.20.tgz

SHA-256: `0ef6484ea4f71c28c6b3dd146349e79786762fc4b42e5b33befea6201c7fa6c8`

`Resources/editor-vendor.js` combines the unmodified core, Shell, SQL, JavaScript / JSON, Markdown and Python modes, and the comment addon. `Resources/editor-vendor.css` is the unmodified core stylesheet. These files are bundled with the app; the editor does not contact a CDN or install a runtime dependency.
