# Burak Çelik — Portfolio

My personal portfolio and CV site. No framework and no build step: hand-written HTML, CSS and JavaScript, with [three.js](https://threejs.org/) for the 3D.

## What's inside

- **Six colour worlds.** Every section has its own palette and its own 3D scene. The ground is a fluid shader that reacts to the pointer, and each section boundary is drawn with a different edge shape.
- **Intro.** The name is built from real cubes sampled from the display typeface. Each cube is on a spring to its place; the pointer pushes them apart and they settle back.
- **About.** Floating keycaps that press down when the pointer passes over them.
- **Projects.** A pinned stepper driven by scroll. Each project has a clickable 3D diorama, its own colour and a detail screen.
- **Skills.** A draggable orbit system with the technologies on three rings.
- **Milestones.** A tunnel you fly through; entries arrive from depth and pass the camera.
- **Contact.** A paper plane that follows the pointer.
- Turkish / English switch, a small terminal (type `help`), reduced-motion support and keyboard navigation.

## Running it

It is a static site. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Opening `index.html` directly from disk can block the fonts from loading, so use a server.

## Structure

```
index.html        page and content (the Turkish copy lives here)
css/              base (colour worlds), sections, effects, chrome, fonts
js/               core, i18n, scroll, projects, depthline, terminal, loader ...
gl/               stage (renderer + ground shader) and one scene per section
fonts/            Bricolage Grotesque and Spline Sans Mono (SIL OFL)
```

Each section's scene lives in `gl/scene-*.js` and registers itself with `BC.gl.add(index, {scene, cam, update})`. The English copy is in `js/i18n.js` and `js/data.js`.

## Deploying

GitHub Pages: *Settings → Pages → Deploy from a branch → main / root*. Nothing else to configure.

## Licences

The fonts are licensed under the SIL Open Font License 1.1 (texts in `fonts/`). three.js is MIT licensed and loaded from a CDN.

## Contact

burakcelik1061@gmail.com · [github.com/burakcelik1061-star](https://github.com/burakcelik1061-star)
