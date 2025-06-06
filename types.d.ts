
type StaticData = {
    hostName: string;
};

type FrameWindowAction = "MINIMIZE" | "MAXIMIZE" | "CLOSE";

type EventPayload = {
    getStaticData: StaticData;
    changeFrameAction: FrameWindowAction;
    startTcpTest: TcpTest;
    resizeWindow: Resize;
}

type TcpTest = "startTcpTest" | "stopTcpTest";

type Resize = 'smaller' | 'bigger';

type UnsubscribeFunction = () => void;

interface Window {
    electron: {
        startTcpTest: (payload: TcpTest) => void;
        resizeWindow: (payload: Resize) => void;
        getStaticData: () => Promise<StaticData>;
        changeFrameAction: (payload: FrameWindowAction) => void;
    }
}