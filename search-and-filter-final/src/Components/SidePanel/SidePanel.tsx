import React, { useEffect, useState, useRef } from "react";
import "./SidePanel.scss";

import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import { when } from "@arcgis/core/core/watchUtils";
import Handles from "@arcgis/core/core/Handles";

import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-pick-list";
import "@esri/calcite-components/dist/components/calcite-pick-list-item";
import {
  CalcitePanel,
  CalciteShellPanel,
  CalcitePickList,
  CalcitePickListItem
} from "@esri/calcite-components-react";

function SidePanel(props) {
  const handles = new Handles();
  const handlesKey = "layer-handles";
  const { view, legend, fLayerView, layerSearchSource } = props;

  const [activeLayerInfo, setActiveLayerInfo] = useState(null);
  const [legendInfos, setLegendInfos] = useState(null);

  const pickList: React.RefObject<HTMLCalcitePickListElement> = useRef(null);

  useEffect(() => {
    return function cleanup() {
      handles.removeAll();
      handles.destroy();
    };
  }, []);

  useEffect(() => {
    if (!view || !legend || !layerSearchSource) {
      return;
    }
    addActiveLayerInfoHandles(view, legend);
  }, [view, legend, layerSearchSource]);

  const addActiveLayerInfoHandles = (view, legend) => {
    handles.add(
      when(view, "map.layers", async () => {
        handles.add(
          when(legend, "viewModel.activeLayerInfos.length", () => {
            const activeLayerInfo = legend.activeLayerInfos.find(
              activeLayerInfo =>
                activeLayerInfo.layer.id === layerSearchSource.layer.id
            );
            setActiveLayerInfo(activeLayerInfo);
          }),
          handlesKey
        );
      }),
      handlesKey
    );
  };

  useEffect(() => {
    if (!activeLayerInfo) {
      return;
    }
    addLegendElementHandles(activeLayerInfo);
  }, [activeLayerInfo]);

  const addLegendElementHandles = activeLayerInfo => {
    handles.add(
      when(activeLayerInfo, "legendElements.length", () => {
        const legendInfos = activeLayerInfo.legendElements[0].infos;
        setLegendInfos(legendInfos);
      }),
      handlesKey
    );
  };

  useEffect(() => {
    if (!fLayerView || !pickList?.current) {
      return;
    }

    pickList.current.addEventListener(
      "calciteListChange",
      pickListChangeCallback
    );
  }, [pickList?.current, fLayerView]);

  const pickListChangeCallback = e => {
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
      // Applies filter to map
      fLayerView.filter = filter;
      // Applies filter to layer search source in search widget
      layerSearchSource.filter = filter;
    }
  };

  return (
    <CalciteShellPanel slot="primary-panel">
      <CalcitePanel>
        <header slot="header-content">Select fuel type to filter</header>
        <CalcitePickList ref={pickList} multiple={true}>
          {legendInfos?.map(legendInfo => (
            <CalcitePickListItem
              key={legendInfo.value}
              value={legendInfo.value}
              label={legendInfo.label}
            ></CalcitePickListItem>
          ))}
        </CalcitePickList>
      </CalcitePanel>
    </CalciteShellPanel>
  );
}

export default SidePanel;
