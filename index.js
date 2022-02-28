require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Home",
  "esri/widgets/Legend",
  "esri/widgets/Search",
  "esri/widgets/Search/LayerSearchSource",
  "esri/widgets/Expand",
  "esri/layers/support/FeatureFilter",
  "esri/core/watchUtils"
], (
  WebMap,
  MapView,
  Home,
  Legend,
  Search,
  LayerSearchSource,
  Expand,
  FeatureFilter,
  watchUtils
) => {
  // CREATE WEB MAP AND MAP VIEW
  const map = new WebMap({
    portalItem: {
      id: "ddf28dc057b8400dbfa148ef403f7c57"
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map
  });

  watchUtils.on(view, "map.layers", "change", async () => {
    const layer = view.map.layers.getItemAt(0);

    // CREATE SEARCH SOURCE

    const layerSearchSource = new LayerSearchSource({
      layer,
      placeholder: "Search for a country name...",
      displayField: "fuel1",
      searchFields: ["country", "country_long"],
      name: layer.title,
      maxResults: 6,
      maxSuggestions: 6
    });

    // ADD WIDGETS I.E. SEARCH, LEGEND, HOME.

    const searchWidget = new Search({
      view,
      sources: [layerSearchSource],
      includeDefaultSources: false
    });

    const search = new Expand({
      view,
      content: searchWidget,
      expanded: true
    });

    const legendWidget = new Legend({
      view
    });

    const legend = new Expand({
      view,
      content: legendWidget,
      expanded: true
    });

    const home = new Home({
      view
    });

    view.ui.add(search, "top-right");
    view.ui.add(legend, "bottom-left");
    view.ui.add(home, "top-left");

    // CREATE FILTER LIST BASED OFF OF LEGEND WIDGET'S ACTIVE LAYER INFOS

    const fLayerView = await view.whenLayerView(layer);

    watchUtils.when(legendWidget, "viewModel.activeLayerInfos.length", () => {
      const activeLayerInfo = legendWidget.activeLayerInfos.getItemAt(0);
      watchUtils.when(activeLayerInfo, "legendElements.length", () => {
        const legendInfos = activeLayerInfo.legendElements[0].infos;
        legendInfos.forEach(info => {
          const pickListItem = document.createElement("calcite-pick-list-item");
          pickListItem.label = info.label;
          pickListItem.value = info.value;
          pickListNode.appendChild(pickListItem);
        });
      });
    });

    // DYNAMICALLY APPLY FILTERS TO FEATURE LAYER VIEW AND SEARCH WIDGET SEARCH SOURCE

    const pickListNode = document.querySelector("calcite-pick-list");
    pickListNode.addEventListener("calciteListChange", e => {
      const detail = e.detail;
      const keys = Array.from(detail.keys());
      const where = keys.map(key => `fuel1 = '${key}'`).join(" OR ");
      if (fLayerView.filter && layerSearchSource.filter) {
        fLayerView.filter.where = where;
        layerSearchSource.filter.where = where;
      } else {
        const filter = new FeatureFilter({
          where
        });
        fLayerView.filter = filter;
        layerSearchSource.filter = filter;
      }
    });
  });
});
