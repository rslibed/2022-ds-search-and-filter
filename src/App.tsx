import React, { useEffect, useState } from "react";
import "./App.scss";

import Header from "./Components/Header/Header";
import View from "./Components/View/View";
import SidePanel from "./Components/SidePanel/SidePanel";

import applicationJSON from "../src/config/application.json";

import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";
import Expand from "@arcgis/core/widgets/Expand";
import Legend from "@arcgis/core/widgets/Legend";
import Search from "@arcgis/core/widgets/Search";
import LayerSearchSource from "@arcgis/core/widgets/Search/LayerSearchSource";
import esriConfig from "@arcgis/core/config";

import "@esri/calcite-components/dist/components/calcite-shell";
import { CalciteShell } from "@esri/calcite-components-react";

function App() {
  const { webmap, portalUrl, layerId, title } = applicationJSON;
  esriConfig.portalUrl = portalUrl;

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);
  const [legend, setLegend] = useState(null);
  const [layerSearchSource, setLayerSearchSource] = useState(null);
  const [fLayerView, setFLayerView] = useState(null);

  useEffect(() => {
    const map = new WebMap({
      portalItem: {
        id: webmap
      }
    });
    loadMap(map);
  }, []);

  const loadMap = async map => {
    await map.loadAll();
    const mapView = new MapView({
      map
    });
    setView(mapView);
    mapView.when().then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!view) {
      return;
    }
    const layer = view.map.findLayerById(layerId);

    // STEP 1: CREATE SEARCH SOURCE
    // const source = new LayerSearchSource({
    //   layer,
    //   placeholder: "Search for a country name...",
    //   displayField: "fuel1",
    //   searchFields: ["country", "country_long"],
    //   name: layer.title,
    //   maxResults: 6,
    //   maxSuggestions: 6
    // });

    // Step 2a: CREATE SEARCH WIDGET
    // const searchWidget = new Search({
    //   view,
    //   sources: [source],
    //   includeDefaultSources: false
    // });

    // const search = new Expand({
    //   view,
    //   content: searchWidget,
    //   expanded: true
    // });

    const legendWidget = new Legend({
      view
    });

    const legend = new Expand({
      view,
      content: legendWidget,
      expanded: true
    });

    // Step 2b: CREATE SEARCH WIDGET
    // view.ui.add(search, "top-right");
    view.ui.add(legend, "bottom-left");

    // Step 2c: CREATE SEARCH WIDGET
    // setLayerSearchSource(source);
    setLegend(legendWidget);

    const loadLayerView = async layer => {
      const loadedLayerView = await view.whenLayerView(layer);
      setFLayerView(loadedLayerView);
    };

    loadLayerView(layer);
  }, [view]);
  return (
    <CalciteShell>
      <Header title={title} />
      {/* Step 3: Add Side Panel  */}
      {/* <SidePanel
        view={view}
        legend={legend}
        layerSearchSource={layerSearchSource}
        fLayerView={fLayerView}
      /> */}
      <View view={view} />
    </CalciteShell>
  );
}

export default App;
