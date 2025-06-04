
import { useEffect, useMemo, useState } from 'react';
import './App.css'
//import { useStatistics } from './statistics'
import  Header  from './Header';

function App() {
  const [server, setServer  = useState("");
  const [log, setLog] = useState([]);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setLog([]);
    setTesting(true);

    try {
      const response = await window.electron.startTcpTest(server);

      if (response.) 
    }
  }

  return (
    <div className="App">
      <Header host={staticData?.hostName ?? ''}/>
      <div>
        <div className='window'>
          <div className='charts'>
            Main
            <div>
              main 2
            </div> 
          </div>
          <div>
            Secondary
          </div>

        </div>   
   
      </div>
    </div>
  );
}



export default App
