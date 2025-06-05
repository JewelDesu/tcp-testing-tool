
type StaticData = {
    hostName: string;
};

type FrameWindowAction = "MINIMIZE" | "MAXIMIZE" | "CLOSE";

type EventPayload = {
    getStaticData: StaticData;
    changeFrameAction: FrameWindowAction;
    startTcpTest: TcpTest;
}

type TcpTest = send;

type UnsubscribeFunction = () => void;

interface Window {
    electron: {
        getStaticData: () => Promise<StaticData>;
        changeFrameAction: (payload: FrameWindowAction) => void;
    }
}