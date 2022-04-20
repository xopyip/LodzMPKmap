import {useMap, useMapEvents} from "react-leaflet";
import React, {ReactNode, useCallback, useEffect, useState, PropsWithChildren} from "react";


type ZoomFilterProps = {
    minZoom: number,
    maxZoom: number,
};

export function ZoomFilter({minZoom, maxZoom, children}: PropsWithChildren<ZoomFilterProps>){
    const map = useMap()
    const [visible, setVisible] = useState(false);
    const updateVisibility = useCallback(() => {
        setVisible(map.getZoom() >= minZoom && map.getZoom() <= maxZoom);
    }, [map, setVisible, minZoom, maxZoom]);


    useMapEvents({
        zoom: updateVisibility
    });

    useEffect(() => {
        updateVisibility();
    }, [updateVisibility]);

    return <>{visible && children}</>;

}
