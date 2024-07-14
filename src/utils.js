import axios from 'axios';

export const startProcess = (url, data, setLog, setEventSource, currentEventSource, setIsProcessRunning, handleLog) => {
  setLog('');

  if (currentEventSource) {
    console.log('Closing current EventSource');
    currentEventSource.close();
  }

  axios.post(url, data)
    .then(response => {
      setLog('Process started\n');
      const newEventSource = new EventSource(`${url.replace('start-', '')}`);
      console.log('New EventSource created:', newEventSource);
      setEventSource(newEventSource);

      newEventSource.onmessage = (event) => {
        console.log('Event Source Message:', event.data);
        let formattedData = event.data;

        if (formattedData.includes('[WARNING]')) {
          formattedData = `<span class="warning">${formattedData}</span>`;
        } else if (formattedData.includes('[ERROR]')) {
          formattedData = `<span class="error">${formattedData}</span>`;
        }

        setLog(prevLog => prevLog + formattedData + '\n');
        
        if (handleLog) {
          handleLog(formattedData);
        }

        if (event.data.includes('Process exited')) {
          console.log('Process exited, closing EventSource');
          newEventSource.close();
          setEventSource(null);
          setIsProcessRunning(false);
        }
      };

      newEventSource.onerror = (event) => {
        let errorMessage = 'An error occurred';
        if (event && event.message) {
          errorMessage = event.message;
        } else if (event && event.target && event.target.readyState === EventSource.CLOSED) {
          errorMessage = 'Connection closed';
        } else if (event && event.target && event.target.readyState === EventSource.CONNECTING) {
          errorMessage = 'Reconnecting';
        }

        console.error('EventSource error:', event);
        setLog(prevLog => prevLog + `Error: ${errorMessage}\n`);
        setIsProcessRunning(false);

        if (event.target.readyState === EventSource.CLOSED) {
          newEventSource.close();
          setEventSource(null);
        }
      };

      newEventSource.onclose = () => {
        console.log('Event Source Closed');
        setLog(prevLog => prevLog + 'Connection closed\n');
        setEventSource(null);
        setIsProcessRunning(false);
      };
    })
    .catch(error => {
      console.error('Axios request failed:', error);
      setLog(`Error: ${error.message || 'Request failed'}\n`);
      setIsProcessRunning(false);
    });
};
