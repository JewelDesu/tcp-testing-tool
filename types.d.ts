
type StaticData = {
    hostName: string;
};

type FrameWindowAction = "MINIMIZE" | "MAXIMIZE" | "CLOSE";

type EventPayload = {
    getStaticData: StaticData;
    changeFrameAction: FrameWindowAction;
    startTcpTest: TcpTest;
}

type TcpTest = "startTcpTest" | "stopTcpTest";

type UnsubscribeFunction = () => void;

interface Window {
    electron: {
        startTcpTest: (payload: TcpTest) => void;
        getStaticData: () => Promise<StaticData>;
        changeFrameAction: (payload: FrameWindowAction) => void;
    }
}