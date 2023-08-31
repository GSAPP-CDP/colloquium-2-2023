# GSAPP CDP Colloquium 2 Course Site

This repository hosts the source code and site content for the 2023
[Computational Design Practices](https://www.arch.columbia.edu/programs/15-m-s-computational-design-practices) 
Colloquium 2 course website.

## Site Structure

The site contains one folder, `work`, that contains student work, plus a few Markdown files:

```
about.md
index.md
public/
work/
├── student1
|   ├── index.html
|   ├── image-1.jpg
|   ├── image-2.jpg
├── student2
|   ├── index.html
|   ├── image-1.jpg
|   ├── image-2.jpg
├── student2
|   ├── index.html
|   ├── image-1.jpg
|   ├── image-2.jpg
├── *
```

## Adding Work

To submit work, first duplicate the `index.html` file in the folder assigned to you. Plan manage and
modify it in a single folder with all your images, videos, and files. This will be the folder you
update, bundle, and re-submit with each assignment.

### index.html

Student index pages will have the following [YAML](https://yaml.org/) frontmatter:

```yaml
---
student: Student Name
tags: students
image: diomede-islands.jpg
---
```

Make sure you put your name in the `student` field. Also replace the prompt "Student Name" throughout 
the file (just search for it) with your name.

The `image` field can reference an image (no more than 1000px wide) that represents your project.
This is optional but recommended. Place the image in the folder as noted below.

### Available Layout Styles

The default stylesheet supports a few CSS classes to aid in simple layout sections.

- `full` - This section spans the full available width.
- `half` - This section will span half the available width. Use these in pairs.
- `video` - This section spans the full available width but also has some extra padding to set the video apart.
- `assignment` - These sections are pre-supplied in the template, so you shouldn't need to use them yourself; they demarcate the header of each assignment section.

See more details in the comments in the `public/colloquium1.css` file.

### Images

Include images and other media in the folder alongside your `index.html` file. Then you can reference
them in simple image tags relatively like this:

```html
<img src="image.png">
```

Keep images small and web-friendly. `git` doesn't do well with big binary blobs like images, and we're 
taking a bit of a shortcut instead of using `git-lfs` for the moment. We don't recommend adding
multiple responsive images yet either, just pick resolutions smaller than about 1150px in width.

### Videos

Youtube, Vimeo, and videos supported by HTML5 can be added thusly:

```html
<!--- YouTube -->
<iframe
  src="https://www.youtube.com/embed/laiVuCmEjlg"
  frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
  style="aspect-ratio: 16 / 9; width: 100%;">
</iframe>

<!--- Vimeo -->
<iframe
  src="https://player.vimeo.com/video/158673446?h=30e98ac368&title=0&byline=0&portrait=0"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  style="aspect-ratio: 16 / 9; width: 100%;">
</iframe>

<!--- HTML5 video -->
<video
  src="earth.mp4"
  controls
  style="aspect-ratio: 16 / 9; width: 100%;">
</video>
```

Note that each element has a `style` attribute that sets the width to 100%.  This allows them 
to be responsive and fill the width of the container.

The aspect ratio can be changed by modifying the `style` attribute to fit your video.

Small video files should be added to the respective student work folders and referenced as above.

### Previewing

This particular `index.html` file is a complete HTML file, so you should be able
to preview your work locally just by opening it in your local browser. On a Mac, you can just
double-click the file. That probably works on Windows, too, with a few more hoops to jump through.

When you see the file in your browser, it will have the frontmatter at the top. It's annoying, but
please just ignore it. It won't render on the class website.

## Markdown Features

Although the `work` folder doesn't use [standard Markdown syntax](https://www.markdownguide.org/basic-syntax/),
the reference below is for site files that do.

The default Markdown parser for Eleventy is [markdown-it](https://github.com/markdown-it/markdown-it).

### Footnotes

Markdown pages can include footnotes:

```md
Fusce et sapien rhoncus, tristique nisi ultrices, dictum tellus[^1].

[^1]: Example footnote content.
```

For more information, see the [markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote) plugin.

### Implicit Figures & Captions

All block-level images in Markdown are converted to figures and figure captions:

```md
![This is my image caption.](/img/image-1.jpg)

<!--- <figure><img src="/img/image-1.jpg"><figcaption>This is my image caption.</figcaption></figure> -->
```

For more information, see the [markdown-it-implicit-figures](https://github.com/arve0/markdown-it-implicit-figures) plugin.

## Development

This site is built with [Eleventy](https://www.11ty.dev/docs/).

After cloning the repo:

```
npm install
npx @11ty/eleventy --serve
```

Browse to <http://localhost:8080/> or use the URL outputted by `yarn start`.

Sometimes this fails with some obscure errors about the passthrough copy. In this case, one troubleshooting step is to completely remove the `_site` folder with `rm -rf _site` and try generating the site again.

## Deployment

This repository is automatically deployed to GitHub Pages whenever a new commit is pushed to the 
`main` branch using a GitHub workflow located at `.github/workflows/deploy.yml`.

## Notes

This repo is based off of the [Computational Design Practices Project Archive](https://github.com/GSAPP-CDP/archive) repo.