export default function Header(props: {host: string, openTest: boolean, onTestToggle: () => void, onTestClose: () => void}) {
    return(
        <header>
          <div className="titleBar">
            <div className="titleBarDiv">
              <button onClick={() => console.log("CLICK")}> {props.host} </button>
            </div>
            <div className="titleBarDiv">
              <button onClick={props.onTestToggle}> {props.openTest ? "Close Test Server" : "Open Test Server"} </button>
            </div>
          </div>
          <div>
            <button id="minimize" onClick={() => window.electron.changeFrameAction('MINIMIZE')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8"/>
              </svg>
            </button>
            <button id="maximize" onClick={() => window.electron.changeFrameAction('MAXIMIZE')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
              </svg>
            </button>
            <button id="close" onClick={() => window.electron.changeFrameAction('CLOSE')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
              </svg>
            </button>
          </div>

        </header>
    )
}