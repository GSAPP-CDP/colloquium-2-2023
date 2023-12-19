const layerTypes = {
  fill: ["fill-opacity"],
  line: ["line-opacity"],
  circle: ["circle-opacity", "circle-stroke-opacity"],
  symbol: ["icon-opacity", "text-opacity"],
  raster: ["raster-opacity"],
  background: ["background-opacity"],
  symbol: ["text-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
};
const alignments = {
  left: "lefty",
  center: "centered",
  right: "righty",
};

/**
 * Main 'story' and header/footer
 */
const story = document.querySelector("#story");
const header = document.querySelector("#header");
const footer = document.querySelector("#footer");
header.classList.add(config.theme);
footer.classList.add(config.theme);

/**
 * Features
 */
const features = document.createElement("section");
features.setAttribute("id", "features");

config.chapters.forEach((record, idx) => {
  const container = document.createElement("div");
  const chapter = document.createElement("div");
  // Creates the title for the vignettes
  if (record.title) {
    const title = document.createElement("h3");
    title.innerText = record.title;
    chapter.appendChild(title);
  }
  // Creates the image for the vignette
  if (record.image) {
    const image = new Image();
    image.src = record.image;
    chapter.appendChild(image);
  }
  // Creates the description for the vignette
  if (record.description) {
    const story = document.createElement("p");
    story.innerHTML = record.description;
    chapter.appendChild(story);
  }
  // Sets the id for the vignette and adds the step css attribute
  container.setAttribute("id", record.id);
  container.setAttribute("data-category", record.data);
  container.classList.add(alignments[record.alignment]);
  container.classList.add("step");
  if (idx === 0) {
    container.classList.add("active");
  }
  // Sets the overall theme to the chapter element
  chapter.classList.add(config.theme);
  container.appendChild(chapter);
  features.appendChild(container);
});
// Appends the features element (with the vignettes) to the story element
story.insertBefore(features, footer);

/**
 * Mapbox & Scrollama
 */
mapboxgl.accessToken = config.accessToken;
const transformRequest = (url) => {
  const hasQuery = url.indexOf("?") !== -1;
  const suffix = hasQuery
    ? "&pluginName=journalismScrollytelling"
    : "?pluginName=journalismScrollytelling";
  return {
    url: url + suffix,
  };
};

const map = new mapboxgl.Map({
  container: "map",
  style: config.style,
  center: config.chapters[0].location.center,
  zoom: config.chapters[0].location.zoom,
  bearing: config.chapters[0].location.bearing,
  pitch: config.chapters[0].location.pitch,
  scrollZoom: false,
  transformRequest: transformRequest,
});

// Instantiates the scrollama function
const scroller = scrollama();

map.on("load", function () {
  // This is the function that finds the first symbol layer
  const layers = map.getStyle().layers;
  let firstSymbolId;
  for (let i = 0; i < layers.length; i++) {
    // console.log(layers[i].id);
    // if (layers[i].type === "symbol") {
    //   firstSymbolId = layers[i].id;
    //   break;
    // }
  }

  // Setup the instance, pass callback functions
  scroller
    .setup({
      step: ".step",
      offset: 0.2,
      progress: true,
      preventDefault: true,
    })
    .onStepEnter((response) => {
      // interaction for objectives section
      if (response.element.dataset.category === "objectives") {
        setLayerOpacity({ layer: "background-white", opacity: 1.0 });
      }

      let chapter = config.chapters.find(
        (chap) => chap.id === response.element.id
      );

      if (chapter) {
        map.flyTo(chapter.location);
        if (chapter.onChapterEnter.length > 0) {
          chapter.onChapterEnter.forEach(setLayerOpacity);
        }
      }
      const selected = document.querySelector(
        `#header_${response.element.dataset.category}`
      );
      selectNavItem(selected);
    })
    .onStepExit((response) => {
      let chapter = config.chapters.find(
        (chap) => chap.id === response.element.id
      );
      if (chapter) {
        if (chapter.onChapterExit.length > 0) {
          chapter.onChapterExit.forEach(setLayerOpacity);
        }
      }
    });
});

/* Here we watch for any resizing of the screen to
adjust our scrolling setup */
window.addEventListener("resize", scroller.resize);

function selectNavItem(selected) {
  navItems = header.children;
  for (let i = 0; i < navItems.length; i++) {
    navItems[i].classList.remove("active");
  }
  selected.classList.add("active");
}

function getLayerPaintType(layer) {
  const layerType = map.getLayer(layer).type;
  return layerTypes[layerType];
}
function setLayerOpacity(layer) {
  const paintProps = getLayerPaintType(layer.layer);
  paintProps.forEach(function (prop) {
    map.setPaintProperty(layer.layer, prop, layer.opacity);
  });
}
