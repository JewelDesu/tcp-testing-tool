import { useMemo } from "react";
import { BaseChart } from "./Chart";
export type ChartProps = {
    data: number[];
    maxDataPoints: number;
    selectedView : "CPU" | "RAM" | "STORAGE";
}

export const COLORS = {
    CPU: {
        stroke: ' #724592 ',
        fill: ' #9772b0 ',
    },
    RAM: {
        stroke: '#9e4c33',
        fill: '#ad7c6d',
    },
    STORAGE: {
        stroke: '#a93226',
        fill: ' #cd6155 ',
    },
};

export function Chart(props: ChartProps) {
    const color = useMemo(() => COLORS[props.selectedView], [props.selectedView]);
    const preparedData = useMemo(() => {
        const points = props.data.map(point => ({ value:point * 100 }))


        return [
            ...points, 
            ...Array.from({ 
                length: props.maxDataPoints - points.length
            }).map(() => ({value: undefined}))];
    }, [props.data, props.maxDataPoints]);

    return <BaseChart data={preparedData} fill={color.fill} stroke={color.stroke}/>
}