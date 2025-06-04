import { Chart } from "./Charts";
import './App.css'
const Options = (props: {title: string, subTitle: string, chart:number[], view: View, onClick: () => void}) => {
    return(
        <button className="options" onClick={props.onClick}>
            <div className="optionSelect">
                <div>{props.title}</div>
                <div>{props.subTitle}</div>
            </div>
            <div className="optionChart">
                <Chart data={props.chart} maxDataPoints={10} selectedView={props.view}/>
            </div>
        </button>
    )
}

export default Options