require([
  "esri/views/MapView",
  "esri/WebMap",
  "esri/widgets/Search",
  "esri/widgets/Search/LayerSearchSource",
  "esri/core/watchUtils",
  "esri/widgets/Legend",
  "esri/widgets/Expand",
  "esri/widgets/Home",
  "esri/layers/support/FeatureFilter"
], (
  MapView,
  WebMap,
  Search,
  LayerSearchSource,
  watchUtils,
  Legend,
  Expand,
  Home,
  FeatureFilter
) => {
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

    const layerSearchSource = new LayerSearchSource({
      layer,
      placeholder: "Search for a country name...",
      displayField: "name",
      searchFields: ["country", "country_long"],
      name: layer.title,
      maxResults: 6,
      maxSuggestions: 6
    });
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

    const fLayerView = await view.whenLayerView(layer);

    watchUtils.when(legendWidget, "viewModel.activeLayerInfos.length", () => {
      const activeLayerInfo = legendWidget.activeLayerInfos.getItemAt(0);
      watchUtils.when(activeLayerInfo, "legendElements.length", () => {
        const legendInfos = activeLayerInfo.legendElements[0].infos;
        const pickListNode = document.querySelector("calcite-pick-list");

        legendInfos.forEach(info => {
          const pickListItem = document.createElement("calcite-pick-list-item");
          pickListItem.label = info.label;
          pickListItem.value = info.value;
          pickListNode.appendChild(pickListItem);
        });

        pickListNode.addEventListener("calciteListChange", e => {
          const detail = e.detail;
          const keys = Array.from(detail.keys());

          const where = keys.map(key => `fuel1 = '${key}'`).join(" OR ");

          if (fLayerView.filter) {
            fLayerView.filter.where = where;
          } else {
            fLayerView.filter = new FeatureFilter({
              where
            });
          }

          if (layerSearchSource.filter) {
            layerSearchSource.filter.where = where;
          } else {
            layerSearchSource.filter = new FeatureFilter({
              where
            });
          }
        });
      });
    });

    view.ui.add(search, "top-right");
    view.ui.add(legend, "bottom-left");
    view.ui.add(home, "top-left");
  });
});
